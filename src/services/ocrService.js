
import { Ocr } from '@capacitor-community/image-to-text';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export const scanText = async () => {
    try {
        const photo = await Camera.getPhoto({
            quality: 90,
            allowEditing: true,
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera // Directly open camera 
        });

        if (!photo.path) {
            throw new Error("No photo path found");
        }

        const data = await Ocr.detectText({
            filename: photo.path,
        });

        return data.textTranslations.map(tx => tx.text).join('\n');
    } catch (error) {
        console.error("OCR Error:", error);
        throw error;
    }
};
