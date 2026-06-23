'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
    getCharacterById,
    type CampaignCharacter,
    type FullCharacterDnd,
} from '@/server/characters/get-characters';
import {
    getDnd5eEquipment,
    type DndEquipmentRecord,
} from '@/server/dungeons&dragons5e/equipment';
import LoadingDots from '@/components/common/LoadingDots';
import {
    updateCharacter,
    addCharacterEquipment,
} from '@/server/characters/update-character';
import { createCampaignBuy } from '@/server/campaigns/create-campaign-buy';
import type { DatabaseCampaignBuyRecord } from '@/types/shared/entities';
import '@/components/lobby/styles/ShopModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

// Currency helpers

type MoneyKey = 'cp' | 'sp' | 'ep' | 'gp' | 'pp';

const CURRENCY_LABELS: Record<MoneyKey, string> = {
    cp: 'PC',
    sp: 'PP',
    ep: 'PE',
    gp: 'PO',
    pp: 'PL',
};

// Maps PT-BR display labels back to the character money field key
const PRICE_LABEL_TO_KEY: Record<string, MoneyKey> = {
    PC: 'cp',
    PP: 'sp',
    PE: 'ep',
    PO: 'gp',
    PL: 'pp',
    // Also accept English abbreviations in case backend sends them
    CP: 'cp',
    SP: 'sp',
    EP: 'ep',
    GP: 'gp',
};

// Exchange rates in copper pieces
const RATES: Record<MoneyKey, number> = {
    cp: 1,
    sp: 10,
    ep: 50,
    gp: 100,
    pp: 1000,
};

const MONEY_KEYS: MoneyKey[] = ['cp', 'sp', 'ep', 'gp', 'pp'];

function emptyMoney() {
    return { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
}

function parsePriceKey(raw: string | number): MoneyKey | null {
    const upper = String(raw).trim().toUpperCase();
    return PRICE_LABEL_TO_KEY[upper] ?? null;
}

function calcConversion(
    amount: number,
    from: MoneyKey,
    to: MoneyKey
): { gross: number; tax: number; net: number } {
    const gross = Math.floor((amount * RATES[from]) / RATES[to]);
    const tax = Math.max(1, Math.floor(gross * 0.05));
    const net = gross - tax;
    return { gross, tax, net };
}

function formatEquipmentPrice(item: DndEquipmentRecord): string {
    return `${item.price[0]} ${item.price[1]}`;
}

function formatEquipmentArmorClass(item: DndEquipmentRecord): string {
    return item.armorClass && item.armorClass.length > 0
        ? item.armorClass.join(' ')
        : '-';
}

function formatEquipmentValue(value?: string): string {
    return value && value.trim() !== '' ? value : '-';
}

// Purchase history

// Props

interface ShopModalProps {
    campaignId: string;
    userId: string;
    userNickname: string;
    lobbyCharacters: CampaignCharacter[];
    buys: DatabaseCampaignBuyRecord[];
    isMaster: boolean;
    isAdminPlayer: boolean;
    refreshCampaign: () => void;
    onClose: () => void;
}

// Component

export default function ShopModal({
    campaignId,
    userId,
    userNickname,
    lobbyCharacters,
    buys,
    isMaster,
    isAdminPlayer,
    refreshCampaign,
    onClose,
}: ShopModalProps): JSX.Element {
    useBodyScrollLock();
    const userChars = useMemo(
        () => lobbyCharacters.filter((c) => c.authorUserId === userId),
        [lobbyCharacters, userId]
    );

    // Character selection
    const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
    const [selectedChar, setSelectedChar] = useState<FullCharacterDnd | null>(null);
    const [charLoading, setCharLoading] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    // Auto-select if exactly one character
    useEffect(() => {
        if (userChars.length === 1) {
            setSelectedCharId(userChars[0].id);
        }
    }, [userChars]);

    const loadChar = useCallback(async (charId: string) => {
        setCharLoading(true);
        const full = await getCharacterById(charId);
        setSelectedChar(full);
        setCharLoading(false);
    }, []);

    useEffect(() => {
        if (selectedCharId) {
            loadChar(selectedCharId);
        }
    }, [selectedCharId, loadChar]);

    const currentMoney = useMemo(
        () => selectedChar?.data?.money ?? emptyMoney(),
        [selectedChar]
    );

    // Equipment data
    const [equipment, setEquipment] = useState<DndEquipmentRecord[]>([]);
    const [equipLoading, setEquipLoading] = useState(true);

    useEffect(() => {
        getDnd5eEquipment()
            .then(setEquipment)
            .finally(() => setEquipLoading(false));
    }, []);

    // Shop tab state
    const [activeTab, setActiveTab] = useState<'shop' | 'vault' | 'history'>('shop');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [buyWarning, setBuyWarning] = useState('');
    const [selectedItem, setSelectedItem] = useState<DndEquipmentRecord | null>(null);
    const [buying, setBuying] = useState(false);

    const canSeeHistory = isMaster || isAdminPlayer;
    const purchaseHistory = buys ?? [];

    useEffect(() => {
        if (userChars.length === 0 && canSeeHistory) {
            setActiveTab('history');
        }
    }, [canSeeHistory, userChars.length]);

    const uniqueTypes = useMemo(() => {
        const types = new Set(equipment.map((e) => e.type).filter(Boolean));
        return Array.from(types).sort();
    }, [equipment]);

    const filteredEquipment = useMemo(() => {
        return equipment.filter((item) => {
            const matchesSearch =
                searchQuery.trim() === '' ||
                item.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
            const matchesType = typeFilter === 'all' || item.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [equipment, searchQuery, typeFilter]);

    const handleBuy = useCallback(async () => {
        if (!selectedChar || !selectedItem) return;

        const amount = Number(selectedItem.price[0]);
        const priceKey = parsePriceKey(selectedItem.price[1]);

        if (!priceKey || isNaN(amount) || amount <= 0) return;

        const currentAmount = currentMoney[priceKey] ?? 0;

        if (currentAmount < amount) {
            setBuyWarning(
                'O personagem selecionado não possuí­ dinheiro para este item.'
            );
            return;
        }

        setBuyWarning('');
        setBuying(true);

        const newMoney = {
            ...currentMoney,
            [priceKey]: currentAmount - amount,
        };
        const cost = `${selectedItem.price[0]} ${selectedItem.price[1]}`;
        const character = selectedChar.data?.profile?.name ?? selectedChar.characterId;
        const date = new Date().toLocaleString('pt-BR');

        try {
            const success = await updateCharacter(selectedChar.characterId, {
                data: { money: newMoney },
            });

            if (!success || !selectedCharId) {
                setBuyWarning('Erro ao concluir compra.');
                return;
            }

            await addCharacterEquipment(
                selectedChar.characterId,
                selectedItem.equipmentId
            );
            await loadChar(selectedCharId);

            try {
                await createCampaignBuy(campaignId, {
                    name: selectedItem.name,
                    cost,
                    character,
                    user: userNickname,
                    date,
                });
                refreshCampaign();
            } catch (error: any) {
                setBuyWarning(
                    error?.message ??
                        'A compra foi concluí­da, mas não foi possível salvar no Histórico.'
                );
            }
        } catch (error: any) {
            setBuyWarning(error?.message ?? 'Erro ao concluir compra.');
        } finally {
            setBuying(false);
            setSelectedItem(null);
        }
    }, [
        campaignId,
        selectedChar,
        selectedItem,
        currentMoney,
        selectedCharId,
        loadChar,
        refreshCampaign,
        userNickname,
    ]);

    // Vault tab state
    const [fromCurrency, setFromCurrency] = useState<MoneyKey>('gp');
    const [toCurrency, setToCurrency] = useState<MoneyKey>('sp');
    const [convertAmount, setConvertAmount] = useState('');
    const [vaultWarning, setVaultWarning] = useState('');
    const [converting, setConverting] = useState(false);

    const parsedConvertAmount = Number(convertAmount);
    const isConvertAmountValid =
        convertAmount.trim() !== '' &&
        Number.isFinite(parsedConvertAmount) &&
        Number.isInteger(parsedConvertAmount) &&
        parsedConvertAmount > 0 &&
        fromCurrency !== toCurrency;

    const conversionPreview = useMemo(() => {
        if (!isConvertAmountValid) return null;
        return calcConversion(parsedConvertAmount, fromCurrency, toCurrency);
    }, [isConvertAmountValid, parsedConvertAmount, fromCurrency, toCurrency]);

    const canConvert =
        isConvertAmountValid &&
        conversionPreview !== null &&
        conversionPreview.net > 0 &&
        (currentMoney[fromCurrency] ?? 0) >= parsedConvertAmount;

    const handleConvert = useCallback(async () => {
        if (!selectedChar || !conversionPreview || !canConvert) return;

        if (conversionPreview.net <= 0) {
            setVaultWarning('Conversão insuficiente para cobrir a taxa.');
            return;
        }

        if ((currentMoney[fromCurrency] ?? 0) < parsedConvertAmount) {
            setVaultWarning('Saldo insuficiente para realizar a conversão.');
            return;
        }

        setVaultWarning('');
        setConverting(true);

        const newMoney = {
            ...currentMoney,
            [fromCurrency]: (currentMoney[fromCurrency] ?? 0) - parsedConvertAmount,
            [toCurrency]: (currentMoney[toCurrency] ?? 0) + conversionPreview.net,
        };

        const success = await updateCharacter(selectedChar.characterId, {
            data: { money: newMoney },
        });

        if (success && selectedCharId) {
            await loadChar(selectedCharId);
            setConvertAmount('');
        }

        setConverting(false);
    }, [
        selectedChar,
        conversionPreview,
        canConvert,
        currentMoney,
        fromCurrency,
        toCurrency,
        parsedConvertAmount,
        selectedCharId,
        loadChar,
    ]);

    // Render helpers

    const renderMoneyBar = () => (
        <div className="sm-money-bar">
            {MONEY_KEYS.map((key) => (
                <div key={key} className="sm-money-item">
                    <span className="sm-money-label">{CURRENCY_LABELS[key]}</span>
                    <span className="sm-money-value">{currentMoney[key] ?? 0}</span>
                </div>
            ))}
        </div>
    );

    const renderPickerCard = (char: CampaignCharacter) => (
        <button
            key={char.id}
            type="button"
            className="sm-picker-card"
            onClick={() => {
                setSelectedCharId(char.id);
                setShowPicker(false);
                setBuyWarning('');
                setVaultWarning('');
                setSelectedItem(null);
            }}
        >
            <div className="sm-picker-avatar">
                {char.image ? (
                    <Image
                        src={char.image}
                        alt={char.name}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <div className="w-full h-full bg-color-greyScale/200" />
                )}
            </div>
            <div className="sm-picker-info">
                <span className="font-M-semibold">{char.name}</span>
            </div>
        </button>
    );

    const renderShopTab = () => (
        <div className="flex flex-col gap-4">
            {/* Filters */}
            <div className="sm-filters">
                <input
                    type="text"
                    className="sm-search-input"
                    placeholder="Buscar por nome..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setBuyWarning('');
                        setSelectedItem(null);
                    }}
                />
                <select
                    className="sm-type-select"
                    value={typeFilter}
                    onChange={(e) => {
                        setTypeFilter(e.target.value);
                        setBuyWarning('');
                        setSelectedItem(null);
                    }}
                >
                    <option value="all">Todos os tipos</option>
                    {uniqueTypes.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
            </div>

            {/* Buy action bar */}
            {selectedItem && (
                <div className="sm-buy-bar">
                    <span className="sm-buy-bar-label">
                        {selectedItem.name} - {selectedItem.price[0]}{' '}
                        {selectedItem.price[1]}
                    </span>
                    <button
                        type="button"
                        className="sm-buy-btn"
                        disabled={!selectedChar || buying}
                        onClick={handleBuy}
                    >
                        {buying ? '...' : 'Comprar'}
                    </button>
                </div>
            )}

            {buyWarning && <p className="sm-warning">{buyWarning}</p>}

            {/* Table */}
            <div className="sm-table-wrapper">
                <table className="sm-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>Preço</th>
                            <th>CA</th>
                            <th>Força</th>
                            <th>Furtividade</th>
                            <th>Peso</th>
                            <th>Dano</th>
                            <th>Propriedades</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipLoading ? (
                            <tr>
                                <td
                                    colSpan={9}
                                    className="text-center py-8 text-color-greyScale/500"
                                >
                                    <LoadingDots label="Carregando equipamentos" />
                                </td>
                            </tr>
                        ) : filteredEquipment.length === 0 ? (
                            <tr className="sm-empty-row">
                                <td colSpan={9}>Nenhum equipamento encontrado.</td>
                            </tr>
                        ) : (
                            filteredEquipment.map((item, i) => {
                                const isSelected =
                                    selectedItem?.name === item.name &&
                                    selectedItem?.price[0] === item.price[0] &&
                                    selectedItem?.price[1] === item.price[1];
                                const priceDisplay = `${item.price[0]} ${item.price[1]}`;
                                const caDisplay = item.armorClass
                                    ? item.armorClass.join(' ')
                                    : '-';

                                return (
                                    <tr
                                        key={`${item.name}-${i}`}
                                        className={isSelected ? 'sm-row--selected' : ''}
                                        onClick={() => {
                                            setBuyWarning('');
                                            setSelectedItem(isSelected ? null : item);
                                        }}
                                    >
                                        <td className="font-semibold">{item.name}</td>
                                        <td>{item.type || '-'}</td>
                                        <td>{priceDisplay}</td>
                                        <td>{caDisplay}</td>
                                        <td>{item.strength || '-'}</td>
                                        <td>{item.stealth || '-'}</td>
                                        <td>{item.weight || '-'}</td>
                                        <td>{item.damage || '-'}</td>
                                        <td
                                            className="max-w-[12rem] truncate"
                                            title={item.properties}
                                        >
                                            {item.properties || '-'}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderShopTableTab = () => (
        <div className="flex flex-col gap-4">
            <div className="sm-filters">
                <input
                    type="text"
                    className="sm-search-input"
                    placeholder="Buscar por nome..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setBuyWarning('');
                        setSelectedItem(null);
                    }}
                />
                <select
                    className="sm-type-select"
                    value={typeFilter}
                    onChange={(e) => {
                        setTypeFilter(e.target.value);
                        setBuyWarning('');
                        setSelectedItem(null);
                    }}
                >
                    <option value="all">Todos os tipos</option>
                    {uniqueTypes.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
            </div>

            {buyWarning && <p className="sm-warning">{buyWarning}</p>}

            <div className="sm-table-wrapper">
                <table className="sm-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>Preco</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipLoading ? (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="text-center py-8 text-color-greyScale/500"
                                >
                                    <LoadingDots label="Carregando equipamentos" />
                                </td>
                            </tr>
                        ) : filteredEquipment.length === 0 ? (
                            <tr className="sm-empty-row">
                                <td colSpan={3}>Nenhum equipamento encontrado.</td>
                            </tr>
                        ) : (
                            filteredEquipment.map((item, i) => (
                                <tr
                                    key={`${item.name}-${i}`}
                                    onClick={() => {
                                        setBuyWarning('');
                                        setSelectedItem(item);
                                    }}
                                >
                                    <td className="font-semibold">{item.name}</td>
                                    <td>{item.type || '-'}</td>
                                    <td>{formatEquipmentPrice(item)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSelectedItemModal = () => {
        if (!selectedItem) {
            return null;
        }

        const detailFields = [
            { label: 'Nome', value: selectedItem.name },
            { label: 'Tipo', value: formatEquipmentValue(selectedItem.type) },
            { label: 'Preco', value: formatEquipmentPrice(selectedItem) },
            { label: 'CA', value: formatEquipmentArmorClass(selectedItem) },
            { label: 'Forca', value: formatEquipmentValue(selectedItem.strength) },
            {
                label: 'Furtividade',
                value: formatEquipmentValue(selectedItem.stealth),
            },
            { label: 'Peso', value: formatEquipmentValue(selectedItem.weight) },
            { label: 'Dano', value: formatEquipmentValue(selectedItem.damage) },
            {
                label: 'Propriedades',
                value: formatEquipmentValue(selectedItem.properties),
            },
        ];

        return (
            <div
                className="sm-item-detail-overlay"
                onClick={() => {
                    if (!buying) {
                        setSelectedItem(null);
                    }
                }}
            >
                <div
                    className="sm-item-detail-modal"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="sm-item-detail-header">
                        <div className="sm-item-detail-header-copy">
                            <h3 className="font-L-semibold sm-item-detail-title">
                                {selectedItem.name}
                            </h3>
                            <p className="font-XS-regular sm-item-detail-subtitle">
                                Veja os detalhes do equipamento antes de comprar.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="sm-item-detail-close"
                            aria-label="Fechar detalhes do item"
                            onClick={() => {
                                if (!buying) {
                                    setSelectedItem(null);
                                }
                            }}
                        >
                            x
                        </button>
                    </div>

                    {buyWarning && <p className="sm-warning">{buyWarning}</p>}

                    <div className="sm-item-detail-grid">
                        {detailFields.map((field) => (
                            <div
                                key={field.label}
                                className={`sm-item-detail-field${
                                    field.label === 'Propriedades'
                                        ? ' sm-item-detail-field--full'
                                        : ''
                                }`}
                            >
                                <span className="sm-item-detail-label">
                                    {field.label}
                                </span>
                                <span className="sm-item-detail-value">
                                    {field.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="sm-item-detail-footer">
                        <button
                            type="button"
                            className="sm-item-detail-secondary"
                            onClick={() => {
                                if (!buying) {
                                    setSelectedItem(null);
                                }
                            }}
                        >
                            Fechar
                        </button>
                        <button
                            type="button"
                            className="sm-buy-btn !bg-color-primary/default_900"
                            disabled={!selectedChar || buying}
                            onClick={handleBuy}
                        >
                            {buying ? '...' : 'Comprar'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderHistoryTab = () => (
        <div className="flex flex-col gap-4">
            {purchaseHistory.length === 0 ? (
                <p className="sm-loading">Nenhuma compra registrada nesta campanha.</p>
            ) : (
                <div className="sm-table-wrapper">
                    <table className="sm-table sm-history-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Custo</th>
                                <th>Personagem</th>
                                <th>Usuário</th>
                                <th>Data / Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseHistory.map((record, i) => (
                                <tr key={i}>
                                    <td className="font-semibold">{record.name}</td>
                                    <td>{record.cost}</td>
                                    <td>{record.character}</td>
                                    <td>{record.user}</td>
                                    <td className="sm-history-date">{record.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderVaultTab = () => (
        <div className="flex flex-col gap-6">
            {/* Money display */}
            <div className="sm-vault-money-grid">
                {MONEY_KEYS.map((key) => (
                    <div key={key} className="sm-vault-currency-box">
                        <span className="sm-money-label">{CURRENCY_LABELS[key]}</span>
                        <span className="sm-money-value text-lg">
                            {currentMoney[key] ?? 0}
                        </span>
                    </div>
                ))}
            </div>

            {/* Conversion form */}
            <div className="sm-vault-form">
                <h3 className="sm-vault-form-title font-M-semibold">
                    Conversão de Moedas
                </h3>

                <div className="sm-vault-form-row">
                    <span className="sm-vault-label">De</span>
                    <select
                        className="sm-vault-select"
                        value={fromCurrency}
                        onChange={(e) => {
                            setFromCurrency(e.target.value as MoneyKey);
                            setVaultWarning('');
                        }}
                    >
                        {MONEY_KEYS.map((key) => (
                            <option key={key} value={key}>
                                {CURRENCY_LABELS[key]} ({key.toUpperCase()})
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        min="1"
                        className="sm-vault-amount-input"
                        placeholder="Quantidade"
                        value={convertAmount}
                        onChange={(e) => {
                            setConvertAmount(e.target.value);
                            setVaultWarning('');
                        }}
                    />

                    <span className="text-color-greyScale/500 font-semibold">&gt;</span>

                    <select
                        className="sm-vault-select"
                        value={toCurrency}
                        onChange={(e) => {
                            setToCurrency(e.target.value as MoneyKey);
                            setVaultWarning('');
                        }}
                    >
                        {MONEY_KEYS.map((key) => (
                            <option key={key} value={key}>
                                {CURRENCY_LABELS[key]} ({key.toUpperCase()})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Preview */}
                {conversionPreview && fromCurrency !== toCurrency && (
                    <div className="sm-vault-preview">
                        <div className="sm-vault-preview-item">
                            <span className="sm-vault-preview-label">
                                Conversão bruta
                            </span>
                            <span className="sm-vault-preview-value">
                                {conversionPreview.gross} {CURRENCY_LABELS[toCurrency]}
                            </span>
                        </div>
                        <div className="sm-vault-preview-item">
                            <span className="sm-vault-preview-label">Taxa (5%)</span>
                            <span className="sm-vault-preview-value--tax">
                                {conversionPreview.tax} {CURRENCY_LABELS[toCurrency]}
                            </span>
                        </div>
                        <div className="sm-vault-preview-item">
                            <span className="sm-vault-preview-label">Você receberá</span>
                            <span className="sm-vault-preview-value">
                                {Math.max(0, conversionPreview.net)}{' '}
                                {CURRENCY_LABELS[toCurrency]}
                            </span>
                        </div>
                    </div>
                )}

                {vaultWarning && <p className="sm-warning">{vaultWarning}</p>}

                {fromCurrency === toCurrency && convertAmount.trim() !== '' && (
                    <p className="sm-warning">
                        Selecione moedas diferentes para converter.
                    </p>
                )}

                <button
                    type="button"
                    className="sm-convert-btn"
                    disabled={!canConvert || converting}
                    onClick={handleConvert}
                >
                    {converting ? 'Convertendo...' : 'Converter'}
                </button>
            </div>
        </div>
    );

    // Main render

    return (
        <div className="sm-overlay">
            <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sm-header">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-L-semibold sm-title">Loja de Equipamentos</h2>
                        {selectedChar && !showPicker && (
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="sm-char-name font-XS-bold">
                                    {selectedChar.data?.profile?.name ?? '-'}
                                </span>
                                {userChars.length > 1 && (
                                    <button
                                        type="button"
                                        className="sm-change-char-btn"
                                        onClick={() => {
                                            setShowPicker(true);
                                            setBuyWarning('');
                                            setVaultWarning('');
                                        }}
                                    >
                                        Trocar personagem
                                    </button>
                                )}
                            </div>
                        )}
                        {selectedChar && !showPicker && renderMoneyBar()}
                    </div>
                    <button
                        type="button"
                        className="sm-close-btn font-M-semibold"
                        onClick={onClose}
                    >
                        x
                    </button>
                </div>

                {/* No characters */}
                {userChars.length === 0 && (
                    <p className="sm-picker-empty">
                        Você não possui personagens nesta campanha.
                    </p>
                )}

                {/* Character picker */}
                {userChars.length > 0 && (showPicker || !selectedCharId) && (
                    <div className="flex flex-col gap-4">
                        <h3 className="font-M-semibold text-color-greyScale/700">
                            Selecione o personagem que irá comprar:
                        </h3>
                        <div className="sm-picker-grid">
                            {userChars.map(renderPickerCard)}
                        </div>
                    </div>
                )}

                {/* Main content: tabs */}
                {!showPicker &&
                    (selectedCharId || (canSeeHistory && userChars.length === 0)) && (
                        <>
                            {selectedCharId && charLoading ? (
                                <p className="sm-loading">
                                    <LoadingDots label="Carregando personagem" />
                                </p>
                            ) : (
                                <>
                                    {/* Tabs */}
                                    <div className="sm-tabs">
                                        <button
                                            type="button"
                                            className={`sm-tab${
                                                activeTab === 'shop'
                                                    ? ' sm-tab--active'
                                                    : ''
                                            }`}
                                            disabled={!selectedCharId}
                                            onClick={() => {
                                                setActiveTab('shop');
                                                setBuyWarning('');
                                                setSelectedItem(null);
                                            }}
                                        >
                                            Loja
                                        </button>
                                        <button
                                            type="button"
                                            className={`sm-tab${
                                                activeTab === 'vault'
                                                    ? ' sm-tab--active'
                                                    : ''
                                            }`}
                                            disabled={!selectedCharId}
                                            onClick={() => {
                                                setActiveTab('vault');
                                                setVaultWarning('');
                                                setSelectedItem(null);
                                            }}
                                        >
                                            Cofre
                                        </button>
                                        {canSeeHistory && (
                                            <button
                                                type="button"
                                                className={`sm-tab${
                                                    activeTab === 'history'
                                                        ? ' sm-tab--active'
                                                        : ''
                                                }`}
                                                onClick={() => {
                                                    setActiveTab('history');
                                                    setSelectedItem(null);
                                                }}
                                            >
                                                Histórico de Compras
                                            </button>
                                        )}
                                    </div>

                                    {activeTab === 'shop' &&
                                        (selectedCharId ? (
                                            renderShopTableTab()
                                        ) : (
                                            <p className="sm-loading">
                                                Selecione um personagem para comprar
                                                itens.
                                            </p>
                                        ))}
                                    {activeTab === 'vault' &&
                                        (selectedCharId ? (
                                            renderVaultTab()
                                        ) : (
                                            <p className="sm-loading">
                                                Selecione um personagem para acessar o
                                                cofre.
                                            </p>
                                        ))}
                                    {activeTab === 'history' &&
                                        canSeeHistory &&
                                        renderHistoryTab()}
                                </>
                            )}
                        </>
                    )}
                {renderSelectedItemModal()}
            </div>
        </div>
    );
}
