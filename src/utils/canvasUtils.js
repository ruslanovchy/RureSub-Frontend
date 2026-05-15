export const getCroppedImg = (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve, reject) => {
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;

            ctx.drawImage(
                image,
                pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
                0, 0, pixelCrop.width, pixelCrop.height
            );

            const blob = canvas.toBlob((blob) => {

                const file = new File([blob], 'cropped_image.jpg', { type: "image/jpeg" });

                resolve(file);
            }, "image/jpeg", 0.80);

        };
        image.onerror = error => reject(error)
    })
}