'use client';
import '@/components/home/styles/ErrorModal.css';

interface Props {
    message: string;
    onClose: () => void;
}

export default function ErrorModal({ message, onClose }: Props): JSX.Element {
    return (
        <div className="err-backdrop">
            <div className="err-modal" onClick={(e) => e.stopPropagation()}>
                <button className="err-close-btn" onClick={onClose}>
                    &times;
                </button>
                <p className="err-message font-S-bold">{message}</p>
            </div>
        </div>
    );
}
