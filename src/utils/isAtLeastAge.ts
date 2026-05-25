export default function isAtLeastAge(
    birthday: string,
    minimumAge: number,
    referenceDate = new Date()
): boolean {
    const [year, month, day] = birthday.split('-').map(Number);

    if (!year || !month || !day) return false;

    let age = referenceDate.getFullYear() - year;
    const currentMonth = referenceDate.getMonth() + 1;
    const currentDay = referenceDate.getDate();

    if (currentMonth < month || (currentMonth === month && currentDay < day)) {
        age -= 1;
    }

    return age >= minimumAge;
}
