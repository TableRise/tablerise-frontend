import { useRef } from 'react';

export default function CreateCampaignModalThirdStep({
    mainHistory,
    setMainHistory,
}: any) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const wrapSelection = (before: string, after: string) => {
        const textarea = textareaRef.current;

        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = mainHistory.slice(start, end);
        const nextValue =
            mainHistory.slice(0, start) +
            before +
            selected +
            after +
            mainHistory.slice(end);

        setMainHistory(nextValue);

        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        });
    };

    const applyHeading = (prefix: string) => {
        const textarea = textareaRef.current;

        if (!textarea) return;

        const cursor = textarea.selectionStart;
        const lineStart = mainHistory.lastIndexOf('\n', cursor - 1) + 1;
        const lineEnd = mainHistory.indexOf('\n', cursor);
        const end = lineEnd === -1 ? mainHistory.length : lineEnd;
        const line = mainHistory.slice(lineStart, end);
        const cleanLine = line.replace(/^#{1,3}\s/, '');
        const nextLine = prefix ? `${prefix} ${cleanLine}` : cleanLine;

        setMainHistory(
            mainHistory.slice(0, lineStart) + nextLine + mainHistory.slice(end)
        );

        requestAnimationFrame(() => textarea.focus());
    };

    return (
        <div className="ccm-step-content">
            <div className="ccm-field">
                <span className="font-S-bold ccm-field-label">História</span>
                <span className="font-XS-regular ccm-field-hint">
                    Escreva aqui sua história, contextualize o jogador sobre o mundo que
                    estarão acompanhando nessa jornada!*
                </span>

                <div className="ccm-richtext-wrapper">
                    <div className="ccm-richtext-toolbar">
                        <button
                            type="button"
                            className="font-S-bold ccm-richtext-tool"
                            title="Negrito"
                            onClick={() => wrapSelection('**', '**')}
                        >
                            B
                        </button>
                        <button
                            type="button"
                            className="font-S-bold ccm-richtext-tool ccm-richtext-tool--italic"
                            title="Italico"
                            onClick={() => wrapSelection('*', '*')}
                        >
                            I
                        </button>
                        <button
                            type="button"
                            className="font-S-bold ccm-richtext-tool ccm-richtext-tool--strike"
                            title="Tachado"
                            onClick={() => wrapSelection('~~', '~~')}
                        >
                            S
                        </button>
                        <div className="ccm-richtext-divider" />
                        <select
                            className="ccm-richtext-select font-XXS-regular"
                            defaultValue=""
                            onChange={(event) => {
                                applyHeading(event.target.value);
                                event.target.value = '';
                            }}
                        >
                            <option value="">Tamanho</option>
                            <option value="">Normal</option>
                            <option value="#">Grande</option>
                            <option value="##">Medio</option>
                            <option value="###">Pequeno</option>
                        </select>
                    </div>
                    <textarea
                        ref={textareaRef}
                        className="ccm-richtext-area"
                        placeholder="Insira o texto"
                        value={mainHistory}
                        maxLength={2500}
                        rows={8}
                        onChange={(e) => setMainHistory(e.target.value)}
                    />
                    <span className="font-XXS-regular ccm-char-count ccm-char-count--richtext">
                        {mainHistory.length}/2500
                    </span>
                </div>
            </div>
        </div>
    );
}
