function initProfilePage() {
    if (!window.profileData) return;

    if (isUserLoggedIn()) {
        addFollowButton();
    }

    makeProfilePostsInteractive();

    addProfileInteractions();

    console.log(profileData);
    if (window.profileData && window.profileData.backgroundId) {
        const background = background_images.find(bg => bg.id === window.profileData.backgroundId);
        if (background) {
            document.getElementById('profile-body').style.backgroundImage = 'url(' + background.image_url + ')';
        }
    }
}

function addFollowButton() {
    const profileHeader = document.querySelector('.profile-info');
    if (!profileHeader || !window.user || window.user.id === window.profileData.id) {
        return;
    }

    const followBtn = document.createElement('button');
    followBtn.className = 'glass_bt follow-profile-btn';
    followBtn.id = 'profile_follow_btn';

    checkProfileFollowStatus(window.profileData.id).then(isFollowing => {
        if (isFollowing) {
            followBtn.innerHTML = '<i class="fa-solid fa-user-minus"></i> Following';
            followBtn.classList.add('following');
        } else {
            followBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Follow';
        }
    });

    followBtn.onclick = () => toggleProfileFollow();

    profileHeader.appendChild(followBtn);
}

async function checkProfileFollowStatus(profileUserId) {
    try {
        const isFollowing = await api.checkFollowStatus(profileUserId);
        return isFollowing;
    } catch (error) {
        console.error("Error checking follow status:", error);
        return false;
    }
}

async function toggleProfileFollow() {
    if (!isUserLoggedIn()) {
        window.location.href = '/login';
        return;
    }

    const followBtn = document.getElementById('profile_follow_btn');
    if (!followBtn) return;

    const isFollowing = followBtn.classList.contains('following');
    const action = isFollowing ? "unfollow" : "follow";

    try {
        const tempPost = { id: "profile_follow", userId: window.profileData.id };

        const response = action === 'follow'
            ? await api.followPost(tempPost.id)
            : await api.unfollowPost(tempPost.id);

        if (response) {
            const followerCountEl = document.querySelector('.stat-value[data-stat="followers"]');

            if (isFollowing) {
                followBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Follow';
                followBtn.classList.remove('following');
                if (followerCountEl) {
                    const currentCount = parseInt(followerCountEl.textContent.replace(/[^0-9]/g, ''));
                    followerCountEl.textContent = formatNumber(Math.max(0, currentCount - 1));
                }
            } else {
                followBtn.innerHTML = '<i class="fa-solid fa-user-minus"></i> Following';
                followBtn.classList.add('following');
                if (followerCountEl) {
                    const currentCount = parseInt(followerCountEl.textContent.replace(/[^0-9]/g, ''));
                    followerCountEl.textContent = formatNumber(currentCount + 1);
                }
            }
        }
    } catch (error) {
        console.error("Error toggling follow:", error);
    }
}

function makeProfilePostsInteractive() {
    const postCards = document.querySelectorAll('.profile-post-card');

    postCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const postId = card.href.split('/post/')[1];

            sessionStorage.setItem('previousPage', window.location.pathname);

            window.location.href = card.href;
        });
    });
}

function addProfileInteractions() {
    const style = document.createElement('style');
    style.textContent = `
        .follow-profile-btn {
            background-color: rgb(95, 148, 243);
            color: white;
            padding: 10px 20px;
            font-weight: 700;
            margin-top: 10px;
            border: none;
            cursor: pointer;
        }
        
        .follow-profile-btn.following {
            background-color: rgba(190, 213, 255, 0.4);
            border: 1px solid rgb(206, 220, 247, 0.42);
        }
        
        .follow-profile-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(95, 148, 243, 0.4);
        }
        
        .stat-value[data-stat="followers"] {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
    initProfilePage();
});

if (typeof drawPost !== 'undefined') {
    const originalDrawPost = drawPost;
    drawPost = function(data) {
        originalDrawPost(data);

        const usernameElement = document.getElementById("post_username");
        if (usernameElement && data.username) {
            usernameElement.style.cursor = "pointer";
            usernameElement.onclick = (e) => {
                e.preventDefault();
                window.location.href = `/@${data.username}`;
            };
        }
    };
}