export class Utils {
    static async convertImageToBase64(url: string): Promise<string> {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    static addTableToPDF(doc: any, startY: number, margin: any, head: any[], data: any[]) {
        (doc as any).autoTable({
            head: [head],
            body: data,
            theme: 'striped',
            startY: startY,
            margin: margin,
            styles: {
                halign: 'center',
                cellPadding: 2,
            },
            headStyles: {
                halign: 'center',
                fillColor: [0, 82, 136],
                textColor: [255, 255, 255],
            },
            columnStyles: {
                0: { cellWidth: 'auto' },
            },
        });
    }
}

