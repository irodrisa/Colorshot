document.addEventListener('DOMContentLoaded', function () {
    const imageUpload = document.getElementById('imageUpload');
    const uploadedImage = document.getElementById('uploadedImage');

    imageUpload.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                uploadedImage.src = e.target.result;
                uploadedImage.style.display = 'block'; // Show the image element
                imageUpload.style.display = 'none'; // Hide the upload button
            }
            reader.readAsDataURL(file);
        }
    });
});
