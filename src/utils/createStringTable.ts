function createStringTable(arr:any) {
    // Har bir ustun uchun maksimal uzunlikni topamiz
    if (arr.length === 0) return '';

    // 1. Obyektlarning kalitlarini olish
    const keys = Object.keys(arr[0]);
    
    // 2. Jadval sarlavhasi
    let tableString = keys.join('\t') + '\n';
    
    // 3. Har bir obyekt uchun qiymatlarni olish va stringga qo'shish
    arr.forEach((obj:any) => {
        const values = keys.map(key => obj[key]);
        tableString += values.join('\t') + '\n';
    });

    return tableString;
}


export default createStringTable