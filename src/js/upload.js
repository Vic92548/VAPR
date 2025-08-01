if(MainPage){
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = document.getElementById('file');

    if (uploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('dragging');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('dragging');
            }, false);
        });

        uploadArea.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files.length > 0) {
                fileInput.files = files;
                handleFileSelect(files[0]);
            }
        }
    }

    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                handleFileSelect(this.files[0]);
            }
        });
    }

    function handleFileSelect(file) {
        const fileType = file.type;
        const placeholder = document.getElementById('upload-placeholder');
        const preview = document.getElementById('upload-preview');
        const previewImage = document.getElementById('preview_img');
        const previewVideo = document.getElementById('preview_video');

        if (file.size > 50 * 1024 * 1024) {
            notify.error('File too large', 'Please select a file under 50MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            placeholder.style.display = 'none';
            preview.style.display = 'block';

            if (fileType.startsWith('video/')) {
                previewVideo.src = e.target.result;
                previewVideo.style.display = 'block';
                previewImage.style.display = 'none';
            } else if (fileType.startsWith('image/')) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                previewVideo.style.display = 'none';
            } else {
                notify.error('Invalid file type', 'Please upload an image or video file');
                placeholder.style.display = 'flex';
                preview.style.display = 'none';
                return;
            }
        };
        reader.readAsDataURL(file);
    }

    const titleInput = document.getElementById('title');
    const titleCount = document.getElementById('title-count');

    if (titleInput && titleCount) {
        titleInput.addEventListener('input', function() {
            titleCount.textContent = this.value.length;
        });
    }
}

window.submitPost = async function(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submit-post-btn');
    const uploadProgress = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');

    const title = document.getElementById('title').value;
    const link = document.getElementById('link').value;
    const file = document.getElementById('file').files[0];

    if (!file) {
        notify.warning('No media selected', 'Please select an image or video to upload');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Publishing...</span>';

    const formData = new FormData();
    formData.append('title', title);
    formData.append('link', link);

    if (file) {
        const fileExtension = file.name.split('.').pop();
        const fileName = `${new Date().getTime()}.${fileExtension}`;
        const fileContentType = file.type || 'application/octet-stream';
        const blob = new Blob([file], { type: fileContentType });
        formData.append("file", blob, fileName);
    }

    try {
        uploadProgress.style.display = 'block';

        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressFill.style.width = progress + '%';
        }, 200);

        const result = await api.createPost(formData);

        clearInterval(progressInterval);
        progressFill.style.width = '100%';

        if (result.success) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            closeAddPostCard();

            document.getElementById('title').value = '';
            document.getElementById('link').value = '';
            document.getElementById('file').value = '';
            document.getElementById('upload-placeholder').style.display = 'flex';
            document.getElementById('upload-preview').style.display = 'none';
            const titleCount = document.getElementById('title-count');
            if (titleCount) {
                titleCount.textContent = '0';
            }

            notify.success("Post published successfully!");

            if (window.user && result.user) {
                const oldUser = {
                    xp: window.user.xp,
                    level: window.user.level,
                    xp_required: window.user.xp_required
                };

                window.user = result.user;
                setXPProgress(oldUser);
            }

            setTimeout(() => {
                displayPost(result.id);
            }, 500);

        } else {
            throw new Error(result.error || 'Failed to create post');
        }

    } catch (error) {
        console.error('Failed to submit post:', error);

        notify.error('Upload failed', error.message || 'Failed to create post. Please try again.');

    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> <span>Publish Post</span>';
        uploadProgress.style.display = 'none';
        progressFill.style.width = '0%';
    }
}