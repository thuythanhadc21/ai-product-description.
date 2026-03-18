// Biến toàn cục lưu trữ mô tả vừa được tạo
let currentDescription = '';
let currentProductInfo = {};

/**
 * Kiểm tra form và bật/tắt nút "Tạo Mô Tả"
 */
function checkFormCompletion() {
    const productName = document.getElementById('productName').value.trim();
    const features = document.getElementById('features').value.trim();
    const benefits = document.getElementById('benefits').value.trim();
    const seoKeywords = document.getElementById('seoKeywords').value.trim();
    const style = document.getElementById('style').value.trim();
    const button = document.getElementById('generateBtn');

    if (productName && features && benefits && seoKeywords && style) {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
}

/**
 * [YÊU CẦU ĐỀ BÀI]: GỌI AI FUNCTION (AI STUDIO / OPENAI)
 * Tạo mô tả sản phẩm 2 phiên bản dựa trên dữ liệu người dùng nhập
 */
async function generateDescription(event) {
    if (event) event.preventDefault();
    const button = document.getElementById('generateBtn');
    button.disabled = true;
    button.classList.add('loading');
    button.innerText = 'Đang tạo bằng AI...';

    try {
        const productName = document.getElementById('productName').value;
        const features = document.getElementById('features').value;
        const benefits = document.getElementById('benefits').value;
        const seoKeywords = document.getElementById('seoKeywords').value;
        const style = document.getElementById('style').value;
        const apiKey = document.getElementById('apiKey').value.trim();

        currentProductInfo = {
            name: productName,
            features: features,
            benefits: benefits,
            seoKeywords: seoKeywords,
            style: style
        };

        const prompt = `Bạn là chuyên gia marketing và viết nội dung E-commerce hàng đầu. Dựa trên thông tin sản phẩm dưới đây, hãy tạo 2-3 phiên bản mô tả sản phẩm chi tiết, logic, chuyên nghiệp và hấp dẫn để bán hàng trên Shopee.

**Thông tin sản phẩm:**
- Tên sản phẩm: ${productName}
- Các tính năng chính (liệt kê): ${features}
- Lợi ích chính cho khách hàng: ${benefits}
- Từ khóa SEO mục tiêu: ${seoKeywords}
- Phong cách bài viết: ${style}

**Yêu cầu cho mỗi phiên bản mô tả:**
1. **Tiêu đề hấp dẫn**: Bắt đầu bằng tiêu đề chứa từ khóa SEO chính, thu hút khách hàng.
2. **Đoạn mô tả ngắn**: Viết 1-2 câu ngắn gọn giới thiệu tổng quan về sản phẩm, dựa trên tên và tính năng chính.
3. **Liệt kê tính năng**: Sử dụng gạch đầu dòng (-) để liệt kê chi tiết các tính năng chính, dựa trên thông tin cung cấp.
4. **Mô tả lợi ích**: Viết đoạn văn logic giải thích lợi ích cho khách hàng, tích hợp từ khóa SEO tự nhiên, thuyết phục mua hàng.
5. **Kết thúc chuyên nghiệp**: Thêm lời kêu gọi hành động (CTA), chính sách bảo hành/đổi trả, và hashtag liên quan.
6. **Phong cách**: ${style} (Gần gũi: thân thiện, gần gũi như bạn bè; Chuyên nghiệp: trang trọng, tin cậy; Trẻ trung: năng động, vui vẻ).
7. **Độ dài**: Mỗi phiên bản khoảng 200-300 từ, đầy đủ thông tin nhưng không dài dòng.

**Lưu ý**: Viết bằng tiếng Việt, chuẩn SEO, logic từ tính năng dẫn đến lợi ích, chuyên nghiệp như bài viết bán hàng thực tế trên Shopee. Phân tách rõ ràng các phiên bản bằng tiêu đề như "Phiên bản 1:", "Phiên bản 2:", v.v.`;

        if (apiKey) {
            let aiResponseText = "";
            // Hỗ trợ cả 2 chuẩn API: Gemini (AI Studio) và OpenAI. API Key Gemini thường không có chữ "sk-"
            if (!apiKey.startsWith('sk-')) { 
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                if (!response.ok) throw new Error("Lỗi kết nối Gemini API");
                const data = await response.json();
                aiResponseText = data.candidates[0].content.parts[0].text;
            } else {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }] })
                });
                if (!response.ok) throw new Error("Lỗi kết nối OpenAI API");
                const data = await response.json();
                aiResponseText = data.choices[0].message.content;
            }

            currentDescription = aiResponseText;
            showGeneratedResult();
        } else {
            setTimeout(() => { fallbackGenerate(productName, features, benefits, seoKeywords, style); }, 1000);
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra. Đang dùng chế độ tạo tự động (Offline)...');
        const productName = document.getElementById('productName').value;
        const features = document.getElementById('features').value;
        const benefits = document.getElementById('benefits').value;
        const seoKeywords = document.getElementById('seoKeywords').value;
        const style = document.getElementById('style').value;
        fallbackGenerate(productName, features, benefits, seoKeywords, style);
    }
}

// Chế độ tạo mô tả mô phỏng (dùng khi không nhập key)
function fallbackGenerate(productName, features, benefits, seoKeywords, style) {
    let description = `**${productName} - Thoải mái và phong cách!**

Bạn đang tìm kiếm một chiếc ${productName} vừa chất lượng, vừa thời trang? Hãy để chúng tôi giải quyết nỗi lo của bạn về việc chọn lựa trang phục hàng ngày!

**Thông tin sản phẩm:**
- Chất liệu: Cotton 100%
- Màu sắc: Đen, Trắng, Be
- Công dụng chính: Thấm hút mồ hôi, mặc đi chơi/đi làm
- Điểm khác biệt: Đường may kép tỉ mỉ, không xù lông

**Các đặc điểm nổi bật:**
- ${features.split('\n').map(f => `- ${f.trim()}`).join('\n')}
- Lợi ích: ${benefits}

**Hướng dẫn chọn size:**
| Size | Chiều cao | Cân nặng |
|------|-----------|----------|
| S    | 160-165cm | 45-55kg  |
| M    | 165-170cm | 55-65kg  |
| L    | 170-175cm | 65-75kg  |

Chính sách bảo hành: Đổi trả trong 7 ngày nếu có lỗi từ nhà sản xuất. Cam kết chất lượng 100%!

#${seoKeywords.replace(/,/g, ' #')}`;

    currentDescription = description;
    showGeneratedResult();
}

function showGeneratedResult() {
    document.getElementById('descriptionText').innerText = currentDescription;
    document.getElementById('output').style.display = 'block';
    document.getElementById('evaluation').style.display = 'none';

    const button = document.getElementById('generateBtn');
    button.disabled = false;
    button.classList.remove('loading');
    button.innerText = 'Tạo Mô Tả';
}

/**
 * [YÊU CẦU ĐỀ BÀI]: SAO CHÉP DỄ DÀNG
 */
function copyDescription() {
    navigator.clipboard.writeText(currentDescription).then(() => {
        const btn = document.getElementById('copyBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Đã sao chép!';
        btn.style.backgroundColor = '#218838';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = '#28a745';
        }, 2000);
    }).catch(err => {
        alert('Có lỗi xảy ra khi sao chép!');
    });
}

/**
 * [YÊU CẦU ĐỀ BÀI]: ĐỊNH DẠNG LẠI (SANG HTML ĐƠN GIẢN)
 */
function formatToHTML() {
    let htmlFormatted = currentDescription
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); // In đậm Markdown (dấu ** của AI)
    
    // Chuyển dấu - thành <li> và wrap bằng <ul>
    const lines = htmlFormatted.split('<br>');
    let inList = false;
    let result = '';
    for (let line of lines) {
        if (line.startsWith('- ')) {
            if (!inList) {
                result += '<ul>';
                inList = true;
            }
            result += '<li>' + line.substring(2) + '</li>';
        } else {
            if (inList) {
                result += '</ul>';
                inList = false;
            }
            result += line + '<br>';
        }
    }
    if (inList) result += '</ul>';
    
    document.getElementById('descriptionText').innerHTML = result;
    currentDescription = result; // Cập nhật biến để khi nhấn Copy sẽ copy luôn mã HTML này
}

/**
 * [YÊU CẦU ĐỀ BÀI]: ĐÁNH GIÁ ĐỘ TIỀM NĂNG MUA HÀNG & LÝ DO
 * Tích hợp lĩnh vực (Sales, CRM)
 */
async function evaluatePotential() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const evalDiv = document.getElementById('evaluation');
    const evalResult = document.getElementById('evaluationResult');

    evalDiv.style.display = 'block';
    evalResult.innerHTML = '<em>Đang dùng AI phân tích tiềm năng theo chuyên ngành Sales/CRM...</em>';

    if (apiKey) {
        try {
            const isGemini = !apiKey.startsWith('sk-');
            const prompt = `Bạn là chuyên gia Sales/CRM. Đánh giá độ tiềm năng mua hàng của mô tả sản phẩm này trên thang 10. Cung cấp điểm số và lý do ngắn gọn (tại sao thuyết phục hoặc chưa).

Mô tả: ${currentDescription}

Định dạng: "Điểm: X/10. Lý do: [ngắn gọn]."`;

            let aiResponseText = "";
            if (isGemini) {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const data = await response.json();
                aiResponseText = data.candidates[0].content.parts[0].text;
            } else {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }] })
                });
                const data = await response.json();
                aiResponseText = data.choices[0].message.content;
            }

            evalResult.innerHTML = aiResponseText.replace(/\n/g, '<br>');
            return;
        } catch (error) {
            console.error("Lỗi AI đánh giá:", error);
        }
    }

    // Đánh giá fallback offline nếu không có key
    const length = currentDescription.length;
    const keywordCount = (currentDescription.match(/SEO|E-commerce|Sản phẩm|Mua hàng|Giá rẻ/gi) || []).length;
    let score = 7; 
    if (length > 250) score += 1;
    if (keywordCount >= 2) score += 1;
    if (currentDescription.includes('Phiên bản 2')) score += 1;
    if (score > 10) score = 10;

    evalResult.innerHTML = `<strong>Điểm: ${score}/10. Lý do:</strong> Mô tả dài (${length} ký tự), chứa ${keywordCount} từ khóa, cấu trúc logic từ tính năng đến lợi ích, thuyết phục khách hàng mua hàng.`;
}

// --- CÁC HÀM PHỤ TRỢ (UI, Upload Ảnh, Counters) ---
function previewImage() {
    const file = document.getElementById('productImageFile').files[0] || document.getElementById('cameraFile').files[0];
    if (file) {
        const img = document.getElementById('imagePreview');
        img.src = URL.createObjectURL(file);
        img.style.display = 'block';
    }
}

function describeFromImage() { alert('Tích hợp AI Vision (Cần API)...'); }
function toggleFaqAnswer(button) { const answer = button.nextElementSibling; if (answer) answer.style.display = answer.style.display === 'block' ? 'none' : 'block'; }
function toggleUploadOptions() { const options = document.getElementById('uploadOptions'); options.style.display = options.style.display === 'none' ? 'block' : 'none'; }
function selectFromLibrary() { document.getElementById('productImageFile').click(); document.getElementById('uploadOptions').style.display = 'none'; }
function takePhoto() { document.getElementById('cameraFile').click(); document.getElementById('uploadOptions').style.display = 'none'; }
function selectFile() { document.getElementById('productImageFile').click(); document.getElementById('uploadOptions').style.display = 'none'; }

function animateCounters() {
    const counters = document.querySelectorAll('.counter-number');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let current = 0; const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) { current = target; clearInterval(timer); }
            counter.innerText = target === 90 ? Math.floor(current) + '%' : Math.floor(current).toLocaleString();
        }, 20);
    });
}

window.addEventListener('load', function() {
    checkLoginStatus();
    animateCounters();
    checkFormCompletion();
    document.getElementById('generateBtn').addEventListener('click', generateDescription);
});

// --- LOGIN SYSTEM ---
function checkLoginStatus() {
    const user = sessionStorage.getItem('user');
    if (user) {
        document.getElementById('homepage').style.display = 'none';
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
    } else {
        document.getElementById('homepage').style.display = 'block';
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainContent').style.display = 'none';
    }
}

function showLoginFromHome() {
    document.getElementById('homepage').style.display = 'none';
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
}

function showLogin() {
    document.querySelector('.signup-form').style.display = 'none';
    document.querySelector('.login-form').style.display = 'block';
}

function backToHome() {
    document.getElementById('homepage').style.display = 'block';
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
}

function showSignup() {
    document.querySelector('.login-form').style.display = 'none';
    document.querySelector('.signup-form').style.display = 'block';
}

function logout() {
    sessionStorage.removeItem('user');
    checkLoginStatus();
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Giả lập đăng nhập (thực tế cần backend)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        sessionStorage.setItem('user', JSON.stringify(user));
        checkLoginStatus();
    } else {
        alert('Email hoặc mật khẩu không đúng!');
    }
});

document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    // Giả lập đăng ký
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        alert('Email đã tồn tại!');
        return;
    }
    
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    sessionStorage.setItem('user', JSON.stringify(newUser));
    checkLoginStatus();
});

// --- PRODUCT MODAL ---
function openProductModal(title, description) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDescription').innerText = description;
    document.getElementById('productModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// --- ARROW KEY NAVIGATION ---
function setupArrowNavigation() {
    // Login form fields
    const loginFields = ['loginEmail', 'loginPassword'];
    
    // Signup form fields
    const signupFields = ['signupName', 'signupEmail', 'signupPassword'];
    
    // Product form fields
    const productFields = ['productName', 'features', 'benefits', 'seoKeywords', 'style', 'apiKey'];
    
    // Function to handle arrow key navigation
    function handleArrowNavigation(event, fieldArray) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const currentIndex = fieldArray.indexOf(event.target.id);
            let nextIndex;
            
            if (event.key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % fieldArray.length;
            } else {
                nextIndex = (currentIndex - 1 + fieldArray.length) % fieldArray.length;
            }
            
            const nextField = document.getElementById(fieldArray[nextIndex]);
            if (nextField) {
                nextField.focus();
                // For select elements, we might want to open the dropdown
                if (nextField.tagName === 'SELECT') {
                    nextField.click();
                }
            }
        }
    }
    
    // Add event listeners to login fields
    loginFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('keydown', (event) => handleArrowNavigation(event, loginFields));
        }
    });
    
    // Add event listeners to signup fields
    signupFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('keydown', (event) => handleArrowNavigation(event, signupFields));
        }
    });
    
    // Add event listeners to product form fields
    productFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('keydown', (event) => handleArrowNavigation(event, productFields));
        }
    });
}

// Initialize arrow navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', setupArrowNavigation);
