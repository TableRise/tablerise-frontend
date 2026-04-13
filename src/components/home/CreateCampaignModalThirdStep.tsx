import Image from 'next/image';
import CloseSVG from '../../../assets/icons/nav/close.svg?url';

export default function CreateCampaignModalThirdStep({ lore, setLore }: any) {
    return (
        <div className="ccm-step-content">
            <div className="ccm-field">
                <span className="font-S-bold ccm-field-label">História</span>
                <span className="font-XS-regular ccm-field-hint">
                    Escreva aqui sua história, contextualize o jogador sobre o mundo que
                    estarão acompanhando nessa jornada!*
                </span>

                {/* Minimal toolbar (UI only) */}
                <div className="ccm-richtext-wrapper">
                    <div className="ccm-richtext-toolbar">
                        <button type="button" className="font-S-bold ccm-richtext-tool">
                            B
                        </button>
                        <button
                            type="button"
                            className="font-S-bold ccm-richtext-tool ccm-richtext-tool--italic"
                        >
                            I
                        </button>
                        <button
                            type="button"
                            className="font-S-bold ccm-richtext-tool ccm-richtext-tool--underline"
                        >
                            U
                        </button>
                        <div className="ccm-richtext-divider" />
                        <button type="button" className="ccm-richtext-tool">
                            <Image
                                src={CloseSVG.src}
                                alt="clear"
                                width={14}
                                height={14}
                                style={{ opacity: 0.5 }}
                            />
                        </button>
                    </div>
                    <textarea
                        className="ccm-richtext-area"
                        placeholder="Insira o texto"
                        value={lore}
                        maxLength={2500}
                        rows={8}
                        onChange={(e) => setLore(e.target.value)}
                    />
                    <span className="font-XXS-regular ccm-char-count ccm-char-count--richtext">
                        {lore.length}/2500
                    </span>
                </div>
            </div>
        </div>
    );
}
