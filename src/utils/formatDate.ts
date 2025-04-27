export default function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    };

    const preFormatedDate = date.toLocaleDateString('pt-BR', options);
    return preFormatedDate.replace(',', ' ·');
}
