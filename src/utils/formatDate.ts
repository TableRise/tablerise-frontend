export default function formatDate(dateString: string): string {
    const cleaned = dateString.replace(/"/g, '');
    const [datePart, timePart] = cleaned.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    return `${day}/${month}/${year} · ${hour}:${minute}`;
}
