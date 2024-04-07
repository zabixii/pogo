document.getElementById('generateButton').addEventListener('click', generateQRCode);

function generateQRCode() {
    console.log("Generating QR codes...");

    const backgroundImage = document.getElementById('backgroundImage').files[0];
    const codeList = document.getElementById('codeList').files[0];

    if (!backgroundImage || !codeList) {
        alert('Please select both background image and code list files.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        console.log("Background image loaded successfully.");
        const backgroundImgData = e.target.result;
        const qr = new QRCode(0, QRCode.ErrorCorrectionLevel.L);
        const codeListReader = new FileReader();

        codeListReader.onload = function(e) {
            console.log("Code list loaded successfully.");
            const codes = e.target.result.split('\n').filter(Boolean);

            const zip = new JSZip();
            const folder = zip.folder('output_images');

            codes.forEach((code, index) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.src = backgroundImgData;

                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    qr.addData(`https://store.pokemongolive.com/offer-redemption?passcode=${code}`);
                    qr.make();
                    const qrCodeData = qr.createDataURL(8, 0);

                    const qrImg = new Image();
                    qrImg.src = qrCodeData;

                    qrImg.onload = function() {
                        ctx.drawImage(qrImg, 50, 50);
                        ctx.fillStyle = 'black';
                        ctx.font = '20px Arial';
                        ctx.fillText(code, 50, 270);

                        const dataUrl = canvas.toDataURL();
                        const imgElement = document.createElement('img');
                        imgElement.src = dataUrl;
                        document.getElementById('outputImages').appendChild(imgElement);

                        // Add image to zip
                        folder.file(`output_image_${index}.png`, dataUrl.split(',')[1], {base64: true});

                        if (index === codes.length - 1) {
                            // Generate and download zip file
                            zip.generateAsync({type: 'blob'}).then((content) => {
                                console.log("Zip file generated successfully.");
                                saveAs(content, 'output_images.zip');
                            });
                        }
                    };
                };
            });
        };

        codeListReader.readAsText(codeList);
    };

    reader.readAsDataURL(backgroundImage);
}
