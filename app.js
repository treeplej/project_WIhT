// app.js

// 모든 .content-box 요소를 가져옵니다.
const contentBoxes = document.querySelectorAll('.content-box');

// 각 .content-box 요소에 이벤트 리스너를 추가합니다.
contentBoxes.forEach((box) => {
    // 마우스를 올렸을 때의 동작을 정의합니다.
    box.addEventListener('mouseover', () => {
        // 이미지에 brightness 필터를 적용하여 어두운 효과를 줍니다.
        box.querySelector('img').style.filter = 'brightness(70%)';
    });

    // 마우스를 벗어났을 때의 동작을 정의합니다.
    box.addEventListener('mouseout', () => {
        // 이미지의 필터를 제거하여 원래 상태로 돌립니다.
        box.querySelector('img').style.filter = 'none';
    });
});
