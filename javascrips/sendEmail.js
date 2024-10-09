/**
 * 發送電子郵件
 * @param {string} toEmail - 收件人的電子郵件地址
 * @param {string} fromEmail - 寄件人的電子郵件地址 (如果適用)
 * @param {string} subject - 郵件主題
 * @param {string} message - 郵件內容
 */
function sendEmail(toEmail, fromEmail = "", subject = "郵件主題", message = "郵件內容") {
    console.log(`寄送郵件至: ${toEmail}`);
    console.log(`來自: ${fromEmail}`);
    console.log(`主題: ${subject}`);
    console.log(`內容: ${message}`);

    // 假設這裡使用郵件 API 進行實際發送
    // 例如，透過郵件 API 來發送郵件
    // fetch('https://api.your-email-service.com/send', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //         to: toEmail,
    //         from: fromEmail,
    //         subject: subject,
    //         text: message
    //     }),
    // }).then(response => {
    //     if (response.ok) {
    //         alert("郵件發送成功！");
    //     } else {
    //         alert("郵件發送失敗，請稍後再試！");
    //     }
    // }).catch(error => {
    //     console.error("發生錯誤: ", error);
    // });

    // 模擬成功發送訊息
    alert(`郵件已成功發送至 ${toEmail}！`);
}

/**
 * 發送驗證信到指定的電子郵件地址
 * @param {string} email - 目標電子郵件地址
 * @param {string} subject - 郵件主題 (預設為 "帳號驗證")
 * @param {string} message - 郵件內容 (預設為 "請點擊以下連結來驗證您的帳號")
 */
function sendVerificationEmail(email, subject = "帳號驗證", message = "請點擊以下連結來驗證您的帳號") {
    sendEmail(email, "", subject, message);
}

// 將此函數導出以便其他文件引入
export { sendEmail, sendVerificationEmail };
