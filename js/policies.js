/* =====================================================================
   NỘI DUNG HỖ TRỢ & CHÍNH SÁCH – Hương Chất Kids
   Mỗi mục: key (dùng trong URL policy.html?p=key), group, title, icon, summary, html.
   Placeholder {hotline} {zalo} {email} {address} {company} {freeship} {shipFee} {expressFee} {hours}
   được thay tự động từ SITE. Cập nhật ngày 28/10/2026.
   ===================================================================== */
window.POLICIES = [
  /* ===================== HỖ TRỢ KHÁCH HÀNG ===================== */
  { key: 'mua-hang', group: 'support', icon: '🛒', title: 'Hướng dẫn mua hàng', summary: '4 cách đặt hàng, xác nhận đơn, thay đổi/huỷ đơn', html: `
<p>Mẹ <b>không cần tạo tài khoản</b>. Chỉ cần họ tên, số điện thoại và địa chỉ nhận hàng là đặt được. Có 4 cách đặt hàng:</p>
<h3>1. Mua ngay trên website (khoảng 30 giây)</h3>
<ol><li>Chọn sản phẩm → bấm <b>Mua ngay</b>.</li><li>Chọn phân loại (vị, số gói/thùng) và số lượng.</li><li>Điền họ tên, số điện thoại, địa chỉ; chọn hình thức thanh toán (mặc định: thanh toán khi nhận hàng).</li><li>Bấm <b>Đặt hàng</b>. Màn hình hiện <b>mã đơn hàng</b> – mẹ chụp lại hoặc lưu để tra cứu.</li></ol>
<p>Lần mua sau, thông tin giao hàng được điền sẵn trên chính thiết bị đó.</p>
<h3>2. Thêm vào giỏ – thanh toán một lần</h3>
<p>Bấm biểu tượng giỏ trên thẻ sản phẩm để gom nhiều sản phẩm, rồi bấm <b>Thanh toán</b>. Ưu đãi <b>mua từ 2 sản phẩm giảm 3%</b> và mã giảm giá được áp dụng tại bước này.</p>
<h3>3. Đặt qua Zalo</h3>
<p>Nhắn tên sản phẩm + số lượng cho Zalo <b>{zalo}</b> (bấm nút <em>Đặt qua Zalo</em> trên trang sản phẩm, tên sản phẩm được tự động sao chép để mẹ dán vào). Chuyên viên tư vấn xác nhận và lên đơn giúp mẹ.</p>
<h3>4. Gọi điện / yêu cầu gọi lại</h3>
<p>Gọi hotline <b>{hotline}</b> ({hours}) hoặc bấm <em>Gọi lại cho tôi</em> và để lại số điện thoại – chúng tôi gọi lại trong giờ làm việc, thường trong 10 phút.</p>
<h3>Xác nhận đơn hàng</h3>
<p>Sau khi đặt, chúng tôi gọi hoặc nhắn Zalo/SMS để xác nhận sản phẩm, số lượng, địa chỉ và tư vấn cách dùng. Đơn đặt ngoài giờ làm việc được xác nhận vào sáng hôm sau. <b>Đơn hàng chỉ có hiệu lực sau khi được xác nhận</b> (khoản 2 Điều 20 Nghị định 52/2013/NĐ-CP về giao kết hợp đồng trong thương mại điện tử).</p>
<h3>Thay đổi hoặc huỷ đơn</h3>
<ul><li>Mẹ có thể đổi phân loại, số lượng, địa chỉ hoặc huỷ đơn <b>miễn phí trước khi đơn được bàn giao cho đơn vị vận chuyển</b> – nhắn Zalo hoặc gọi hotline kèm mã đơn.</li><li>Sau khi hàng đã gửi đi, mẹ vẫn có thể từ chối nhận; phí vận chuyển hai chiều (nếu có) sẽ được thông báo trước khi áp dụng.</li></ul>
<h3>Tra cứu đơn hàng</h3>
<p>Vào mục <a href="account.html">Tài khoản → Đơn hàng gần đây</a> trên thiết bị đã đặt, hoặc nhắn mã đơn cho Zalo {zalo} để được cập nhật trạng thái.</p>` },

  { key: 'thanh-toan', group: 'support', icon: '💳', title: 'Chính sách thanh toán', summary: 'Thanh toán khi nhận hàng, hoàn tiền khi trả hàng', html: `
<h3>Phương thức thanh toán: Thanh toán khi nhận hàng</h3>
<p>Hương Chất Kids thực hiện chính sách thanh toán khi nhận hàng. Cam kết tuân thủ nghiêm ngặt các biện pháp bảo mật thông tin của khách hàng khi thực hiện nhận hàng.</p>
<p>Trường hợp khách hàng hoàn trả hàng, Hương Chất Kids hoàn trả lại tiền đã nhận.</p>` },

  { key: 'giao-hang', group: 'support', icon: '🚚', title: 'Chính sách giao hàng', summary: 'Phương thức và thời gian giao hàng', html: `
<p>Sau khi nhận xác nhận được đơn hàng của quý khách, Hương Chất Kids sẽ nhanh chóng vận chuyển đến tay khách hàng trong thời gian sớm nhất có thể. Nhằm tạo điều kiện thuận lợi cho việc giao hàng và hàng hóa được gửi đến khách hàng sớm nhất, quý khách vui lòng cung cấp chi tiết số nhà, tên đường, phường, thôn, ấp, tổ, khu, bản, xã, tỉnh … một cách chi tiết và chính xác. Chúng tôi có quyền hủy bỏ các đơn đặt hàng không rõ ràng hoặc không chịu trách nhiệm đối với những trường hợp giao hàng chậm trễ hay thất lạc v.v.. do Quý khách cung cấp thông tin không chính xác.</p>
<h3>Các phương thức giao hàng</h3>
<ul><li>Giao hàng thông qua bưu điện;</li><li>Giao hàng thông qua đơn vị vận chuyển Giao Hàng Tiết Kiệm.</li></ul>
<h3>Thời gian giao hàng</h3>
<ul><li>Giao hàng trong vòng 1 ngày kể từ thời điểm đặt hàng đối với các địa chỉ ở nội thành thành phố Hà Nội.</li><li>Đối với các khu vực ngoại thành thành phố Hà Nội, giao hàng trong vòng 2 ngày kể từ thời điểm đặt hàng.</li><li>Những khu vực khác tùy điều kiện thời tiết và kho xử lý, thời gian giao hàng dự kiến từ 05 - 07 ngày kể từ thời điểm đặt hàng.</li></ul>` },

  { key: 'doi-tra', group: 'support', icon: '🔄', title: 'Chính sách đổi trả hàng', summary: 'Đồng kiểm khi nhận, liên hệ trong 24h để được hỗ trợ', html: `
<p>Hương Chất Kids trân trọng sự tin tưởng của khách hàng khi đặt mua sản phẩm.</p>
<p>Hương Chất Kids đảm bảo sản phẩm được bán tại Hương Chất Kids có nguồn gốc rõ ràng. Trong trường hợp khách hàng nhận hàng nhưng hàng có khiếm khuyết, hư hỏng không như mô tả thì Hương Chất Kids cam kết bảo vệ khách hàng bằng chính sách đổi trả hàng như sau:</p>
<p>Quý khách vui lòng đồng kiểm và có thể từ chối tại thời điểm nhận hàng nếu sản phẩm giao đến bị hư hỏng/ không đảm bảo chất lượng/ giao sai sản phẩm hoặc số lượng. Ngoài ra quý khách cần liên hệ Hương Chất Kids tối đa <b>24h</b> kể từ khi nhận hàng để được hỗ trợ.</p>
<h3>Các thông tin cần thiết khi yêu cầu đổi trả</h3>
<p>Để bảo vệ quyền lợi khách hàng, Hương Chất Kids có cơ sở làm việc với các bộ phận liên quan khi có tranh chấp xảy ra, Hương Chất Kids khuyến khích quý khách chuẩn bị các bằng chứng sau để cung cấp khi có yêu cầu:</p>
<ul><li>Video mở kiện hàng từ lúc bắt đầu mở kiện hàng đến kiểm tra sản phẩm bên trong thùng hàng.</li><li>Hình chụp tem kiện hàng có thể hiện mã đơn hàng.</li><li>Hình ảnh thể hiện hàng hóa hư hỏng hoặc tình trạng hàng hóa lúc nhận hàng.</li><li>Tình trạng ngoại quan (băng keo, seal, hình dạng thùng hàng) đặc biệt các vị trí nghi ngờ có tác động đến sản phẩm.</li></ul>
<p>Để hạn chế phát sinh rủi ro trong quá trình vận chuyển hàng hóa trả về nhà bán, quý khách lưu ý đóng gói và bàn giao cho nhân viên thu hồi như khi nhận hàng.</p>` },

  { key: 'kiem-hang', group: 'support', icon: '📦', title: 'Chính sách kiểm hàng', summary: 'Được mở niêm phong kiểm tra hàng khi nhận', html: `
<p>Nhằm đáp ứng nhu cầu và bảo vệ tối đa quyền lợi Khách hàng khi sử dụng dịch vụ của Hương Chất Kids. Hương Chất Kids đã triển khai chính sách hỗ trợ việc xem và kiểm tra hàng hóa khi giao hàng. Khách hàng khi nhận hàng từ nhân viên vận chuyển có thể mở niêm phong để kiểm tra hàng hóa.</p>
<p><b>Lưu ý:</b> việc kiểm tra sẽ không bao gồm việc mở seal (niêm phong) riêng của sản phẩm gây ảnh hưởng đến chất lượng sản phẩm.</p>
<p>Trong trường hợp nhân viên vận chuyển yêu cầu quý khách ký vào biên bản xác nhận khách hàng đã nhận đủ và nguyên vẹn tất cả sản phẩm (biên bản đồng kiểm). Hương Chất Kids khuyến khích quý khách sử dụng tối đa quyền lợi trên trước khi ký xác nhận để được hỗ trợ tốt nhất.</p>` },

  { key: 'bao-mat', group: 'support', icon: '🔒', title: 'Chính sách bảo mật thông tin', summary: 'Thu thập gì, dùng để làm gì, lưu ở đâu, cam kết bảo mật', html: `
<p>Bảo mật thông tin khách hàng là một trong các tiêu chí hoạt động quan trọng của Hương Chất Kids.</p>
<h3>1. Hương Chất Kids thu thập những thông tin gì?</h3>
<p>Hương Chất Kids thu dữ liệu chủ yếu trên website bao gồm:</p>
<ul><li>Họ tên</li><li>Email</li><li>Số điện thoại</li><li>Địa chỉ giao hàng</li></ul>
<p>Trong khi đăng ký tài khoản khách hàng và khi thực hiện lệnh đặt hàng. Đây là những thông tin mà Hương Chất Kids cần khách hàng cung cấp để chúng tôi liên hệ nhằm giao sản phẩm và phục vụ cho khách hàng.</p>
<h3>2. Hương Chất Kids làm gì với những thông tin của bạn?</h3>
<p>Hương Chất Kids sử dụng thông tin khách hàng cung cấp nhằm mục đích:</p>
<ul><li>Liên hệ lại để tư vấn cho khách hàng;</li><li>Giao hàng hóa đến tận nơi cho khách hàng;</li><li>Giải đáp các thắc mắc và yêu cầu của khách hàng;</li><li>Liên hệ chăm sóc khách hàng.</li></ul>
<p>Hương Chất Kids không sử dụng thông tin do khách hàng cung cấp tại website ngoài các mục đích nêu trên.</p>
<h3>3. Thông tin được lưu trữ tại đâu?</h3>
<p>Thông tin do khách hàng cung cấp được lưu trữ bởi ban quản trị và được bảo mật trên máy chủ của Hương Chất Kids.</p>
<p>Thông tin của đơn vị thu thập và quản lý thông tin:</p>
<table class="ptable"><tr><th colspan="2">ĐỖ VĂN HOÀNG</th></tr><tr><th>Mã số doanh nghiệp</th><td>0316333076</td></tr><tr><th>Địa chỉ thường trú</th><td>Thôn Tân Dân Thứa, Lương Tài, Bắc Ninh.</td></tr><tr><th>Mã số thuế cá nhân</th><td>027096008342</td></tr><tr><th>Số điện thoại</th><td>0934617765</td></tr><tr><th>Email</th><td>huongchatkids@gmail.com</td></tr></table>
<h3>4. Thông tin được chỉnh sửa bằng cách nào?</h3>
<p>Dữ liệu thông tin của khách hàng sẽ được quản lý bởi ban quản trị Hương Chất Kids.</p>
<p>Khách hàng có quyền tự kiểm tra, cập nhật, điều chỉnh hoặc hủy bỏ thông tin do mình cung cấp bằng cách đăng nhập vào tài khoản cá nhân và thực hiện việc cập nhật;</p>
<p>Khách hàng có quyền gửi các khiếu nại đến ban quản trị của website liên quan đến nội dung bảo mật thông tin. Ban quản trị sẽ tiếp nhận, xem xét và có những biện pháp xử lý khiếu nại kịp thời.</p>
<h3>5. Đối tượng được tiếp cận với thông tin</h3>
<p>Ban quản trị sẽ không cung cấp thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào, trừ một số đối tượng sau đây:</p>
<ul><li>Theo yêu cầu pháp lý: Có thể tiết lộ thông tin nếu cơ quan nhà nước có thẩm quyền yêu cầu và nhận thấy việc tiết lộ như vậy là cần thiết và đúng quy định của pháp luật;</li><li>Chuyển giao kinh doanh: Trong trường hợp thành lập công ty hoặc tổ chức thì Công ty/tổ chức được thành lập từ Chủ sở hữu Website có quyền truy cập thông tin như chính chủ sở hữu hiện tại.</li></ul>
<h3>6. Cam kết bảo mật thông tin</h3>
<p>Thông tin do khách hàng cung cấp trên website rất quan trọng với Hương Chất Kids và được Hương Chất Kids cam kết bảo mật tuyệt đối theo chính sách bảo vệ thông tin của Hương Chất Kids. Việc sử dụng thông tin của mỗi khách hàng chỉ thực hiện khi có sự đồng ý của khách hàng hoặc theo sự cho phép của pháp luật.</p>
<p>Hương Chất Kids không bán, trao đổi, hoặc sử dụng các hình thức thương mại khác với những thông tin của khách hàng cho bất cứ bên thứ ba nào khác.</p>
<p>Hương Chất Kids từ chối cung cấp dịch vụ pháp lý và ngừng xử lý các yêu cầu có liên quan nếu nhận thấy các thông tin khách hàng cung cấp không chính xác hoặc có mục đích không chính đáng.</p>` },

  { key: 'dieu-khoan', group: 'support', icon: '📜', title: 'Điều khoản sử dụng', summary: 'Quy định chung khi mua hàng trên website', html: `
<h3>1. Phạm vi áp dụng</h3>
<p>Điều khoản này áp dụng cho mọi khách hàng truy cập và mua hàng tại website Hương Chất Kids (sau đây gọi là "Website") do {company} vận hành. Bằng việc đặt hàng, mẹ đồng ý với các điều khoản dưới đây và các chính sách liên quan (giao hàng, đổi trả, bảo mật).</p>
<h3>2. Thông tin sản phẩm và giá</h3>
<ul><li>Thông tin sản phẩm được cung cấp theo tài liệu của nhà sản xuất/nhà nhập khẩu và tem phụ tiếng Việt. Thực phẩm bảo vệ sức khoẻ <b>không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh</b>; hiệu quả có thể khác nhau tuỳ cơ địa (Nghị định 15/2018/NĐ-CP).</li><li>Giá bán bằng VNĐ, đã gồm VAT. Giá gạch ngang là giá niêm yết trước khuyến mãi tại cửa hàng. Chúng tôi có thể điều chỉnh giá nhưng đơn hàng đã xác nhận được giữ nguyên giá tại thời điểm xác nhận.</li><li>Trường hợp hiển thị sai giá do lỗi kỹ thuật rõ ràng, chúng tôi sẽ liên hệ mẹ để xác nhận lại hoặc huỷ đơn và hoàn tiền (nếu đã thanh toán).</li></ul>
<h3>3. Giao kết và huỷ hợp đồng</h3>
<p>Đơn hàng là đề nghị giao kết hợp đồng; hợp đồng được xác lập khi Hương Chất Kids xác nhận đơn qua điện thoại/Zalo/SMS. Mẹ có quyền huỷ đơn miễn phí trước khi bàn giao cho đơn vị vận chuyển; chúng tôi có quyền từ chối đơn khi hết hàng, thông tin không hợp lệ hoặc có dấu hiệu gian lận, và sẽ thông báo lý do.</p>
<h3>4. Khuyến mãi</h3>
<p>Mã giảm giá, ưu đãi mua từ 2 sản phẩm, miễn phí vận chuyển có điều kiện ghi rõ tại từng chương trình, không quy đổi thành tiền mặt và không cộng gộp ngoài quy định. Chương trình khuyến mãi tuân thủ Luật Thương mại và Nghị định 81/2018/NĐ-CP.</p>
<h3>5. Trách nhiệm của khách hàng</h3>
<ul><li>Cung cấp thông tin nhận hàng chính xác; kiểm tra hàng khi nhận.</li><li>Sử dụng sản phẩm theo hướng dẫn và độ tuổi ghi trên bao bì; hỏi ý kiến bác sĩ với bé dưới 1 tuổi, bé có bệnh lý, dị ứng.</li><li>Không sử dụng Website vào mục đích trái pháp luật, không can thiệp kỹ thuật vào hệ thống.</li></ul>
<h3>6. Sở hữu trí tuệ</h3>
<p>Nội dung, hình ảnh, bài viết trên Website thuộc Hương Chất Kids hoặc được sử dụng có phép; không sao chép, phát tán vì mục đích thương mại khi chưa được đồng ý bằng văn bản.</p>
<h3>7. Giới hạn trách nhiệm</h3>
<p>Chúng tôi chịu trách nhiệm về chất lượng hàng hoá theo Luật Bảo vệ quyền lợi người tiêu dùng 2023 và không chịu trách nhiệm với thiệt hại phát sinh do sử dụng sản phẩm sai hướng dẫn, bảo quản không đúng, hoặc sự kiện bất khả kháng (thiên tai, dịch bệnh, lệnh cấm của cơ quan nhà nước).</p>
<h3>8. Giải quyết tranh chấp</h3>
<p>Mọi tranh chấp được ưu tiên giải quyết bằng thương lượng, hoà giải qua hotline/email trong 7 ngày làm việc. Nếu không đạt được thoả thuận, tranh chấp được giải quyết tại Toà án có thẩm quyền theo pháp luật Việt Nam; mẹ cũng có thể yêu cầu cơ quan quản lý nhà nước về bảo vệ người tiêu dùng hỗ trợ.</p>
<h3>9. Thay đổi điều khoản</h3>
<p>Chúng tôi có thể cập nhật điều khoản và sẽ ghi rõ ngày hiệu lực tại đầu trang. Phiên bản áp dụng cho một đơn hàng là phiên bản có hiệu lực tại thời điểm đặt hàng.</p>` },

  /* ===================== VỀ HƯƠNG CHẤT KIDS ===================== */
  { key: 'gioi-thieu', group: 'about', icon: '🌸', title: 'Giới thiệu', summary: 'Chúng tôi là ai, bán gì, ở đâu', html: `
<p><b>Hương Chất Kids</b> – "Mẹ nào cũng là siêu nhân" – là cửa hàng chuyên dinh dưỡng bổ sung nhập khẩu Hàn Quốc cho bé từ 6 tháng đến tuổi dậy thì, được sáng lập bởi những người mẹ từng loay hoay tìm sản phẩm chính hãng cho con mình.</p>
<p>Sau <b>4 năm</b> hoạt động, Hương Chất Kids được <b>hơn 33.000 gia đình Việt</b> tin tưởng lựa chọn, với nguyên tắc không đổi: chỉ bán những sản phẩm được tuyển chọn kỹ lưỡng và có nguồn gốc rõ ràng.</p>
<h3>Sứ mệnh &amp; tầm nhìn</h3>
<ul><li><b>Sứ mệnh:</b> giúp các em bé Việt được bổ sung dinh dưỡng đúng cách để lớn lên khoẻ mạnh.</li><li><b>Tầm nhìn:</b> trở thành hệ sinh thái thương hiệu mẹ &amp; bé uy tín hàng đầu mà gia đình Việt tin cậy.</li></ul>
<h3>Giá trị cốt lõi</h3>
<ul><li><b>Chính trực</b> – hàng chính hãng, thông tin minh bạch.</li><li><b>Tận tâm</b> – tư vấn đặt lợi ích của bé lên trước.</li><li><b>Chất lượng</b> – tuyển chọn kỹ, ưu tiên hàng nhập khẩu.</li><li><b>Đồng hành</b> – gắn bó lâu dài cùng mỗi gia đình.</li></ul>
<h3>Sản phẩm</h3>
<ul><li>Nước ép hoa quả – rau củ hữu cơ Lotte (Pasteur Hàn Quốc), dùng được từ 6 tháng.</li><li>Hồng sâm trẻ em ChuChu, gạc hươu non Sumo Kids.</li><li>Vitamin D3K2 Pure Vitality (New Zealand), canxi hữu cơ Calciumore.</li><li>Rong biển rắc cơm Sung Gyung, Busan; nghệ nano Korea365 cho mẹ.</li></ul>
<h3>Cách chúng tôi làm việc</h3>
<ul><li>Nhập khẩu chính ngạch, đầy đủ tem phụ tiếng Việt và số công bố; hoá đơn VAT theo yêu cầu.</li><li>Tư vấn 1:1 miễn phí qua Zalo/điện thoại trước và sau khi mua: bé mấy tháng dùng được, liều bao nhiêu, kết hợp thế nào.</li><li>Bán trên website này và gian hàng Shopee chính thức với cùng chính sách.</li></ul>
<h3>Chủ sở hữu website</h3>
<table class="ptable"><tr><th colspan="2">ĐỖ VĂN HOÀNG</th></tr><tr><th>Địa chỉ thường trú</th><td>Thôn Tân Dân Thứa, Lương Tài, Bắc Ninh.</td></tr><tr><th>Mã số thuế cá nhân</th><td>027096008342</td></tr><tr><th>Số điện thoại</th><td>0934617765</td></tr><tr><th>Email</th><td>huongchatkids@gmail.com</td></tr></table>
<h3>Thông tin liên hệ</h3>
<ul><li>Địa chỉ: {address}</li><li>Hotline: {hotline} ({hours}) · Zalo: <a href="{zaloLink}" target="_blank" rel="noopener">Hương Chất Kids</a></li><li>Email: {email}</li></ul>
<div class="note">Thông tin pháp nhân (tên doanh nghiệp/hộ kinh doanh, mã số thuế, số giấy chứng nhận đăng ký kinh doanh, cơ quan cấp) sẽ được công bố tại đây và chân trang theo Điều 29 Nghị định 52/2013/NĐ-CP sau khi hoàn tất thủ tục thông báo website với Bộ Công Thương (online.gov.vn).</div>` },

  { key: 'chinh-hang', group: 'about', icon: '🛡️', title: 'Cam kết chính hãng', summary: 'Nguồn gốc, tem phụ, công bố ATTP, hoàn tiền 100% nếu hàng giả', html: `
<h3>Cam kết của chúng tôi</h3>
<ol><li><b>Nhập khẩu chính ngạch</b>: mọi sản phẩm có tờ khai hải quan, chứng nhận xuất xứ (C/O), kiểm nghiệm chất lượng theo lô.</li><li><b>Tem phụ tiếng Việt</b> đúng Nghị định 43/2017/NĐ-CP về nhãn hàng hoá: tên sản phẩm, thành phần, hướng dẫn sử dụng, nhà nhập khẩu, hạn dùng.</li><li><b>Công bố an toàn thực phẩm</b>: sản phẩm thuộc diện tự công bố/đăng ký bản công bố theo Nghị định 15/2018/NĐ-CP; số công bố được ghi trên tem phụ và sẽ được cập nhật tại bảng thông tin từng sản phẩm.</li><li><b>Hạn sử dụng</b>: giao hàng còn tối thiểu 6 tháng (nước ép, hồng sâm) hoặc 12 tháng (vitamin, canxi); hàng cận date luôn ghi rõ và giảm giá riêng.</li><li><b>Hoá đơn VAT</b> xuất theo yêu cầu.</li></ol>
<h3>Nếu phát hiện hàng không chính hãng</h3>
<p>Mẹ gửi ảnh/video sản phẩm và tem qua Zalo {zalo}. Nếu xác minh sản phẩm không đúng nguồn gốc như cam kết, chúng tôi <b>hoàn tiền 100%</b>, thu hồi sản phẩm và chịu toàn bộ chi phí phát sinh, đồng thời chịu trách nhiệm trước pháp luật theo Luật Bảo vệ quyền lợi người tiêu dùng 2023.</p>
<h3>Cách mẹ tự kiểm tra</h3>
<ul><li>Tem phụ tiếng Việt in rõ, có tên nhà nhập khẩu và số công bố.</li><li>Mã QR/mã vạch trên bao bì quét ra đúng sản phẩm.</li><li>Bao bì nguyên seal, chữ Hàn sắc nét; hạn dùng in dập nổi hoặc in phun, không dán đè.</li></ul>
<div class="note">Thực phẩm bảo vệ sức khoẻ không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh. Đọc kỹ hướng dẫn sử dụng và độ tuổi trên bao bì trước khi dùng.</div>` },

  { key: 'faq', group: 'about', icon: '❓', title: 'Câu hỏi thường gặp', summary: 'Độ tuổi, liều dùng, kiểm hàng, giá so với Shopee, hạn dùng…', faq: [
    ['Bé mấy tháng thì dùng được sản phẩm?', 'Mỗi sản phẩm ghi rõ độ tuổi ở trang chi tiết (mục "Phù hợp cho bé"). Nước ép Lotte táo & củ dền dùng từ 6 tháng; hồng sâm ChuChu, canxi Calciumore, rong biển thường từ 1 tuổi; vitamin D3K2 từ sơ sinh. Chưa chắc thì nhắn Zalo để được tư vấn theo tuổi và cân nặng của bé.'],
    ['Liều dùng bao nhiêu là đủ, có dùng chung nhiều sản phẩm được không?', 'Theo hướng dẫn trên bao bì từng sản phẩm. Không dùng cùng lúc nhiều sản phẩm có cùng công dụng (ví dụ hai loại canxi). Sau khi đặt hàng, chuyên viên tư vấn sẽ gọi hướng dẫn liều dùng cụ thể.'],
    ['Mẹ đang cho con bú có dùng nghệ nano Curcumin được không?', 'Sản phẩm dành cho người lớn; mẹ đang mang thai hoặc cho con bú nên hỏi ý kiến bác sĩ trước khi dùng.'],
    ['Có được kiểm tra hàng trước khi thanh toán không?', 'Có. Với đơn COD, mẹ kiểm tra ngoại quan, tem phụ, hạn dùng, số lượng trước khi trả tiền; hàng lỗi, móp rách được từ chối nhận không mất phí.'],
    ['Giá trên web và trên Shopee có giống nhau không?', 'Giá cơ bản giống nhau. Trên web mẹ được thêm ưu đãi mua từ 2 giảm 3%, ưu đãi theo hạng khách hàng và miễn phí vận chuyển cho đơn từ {freeship}.'],
    ['Hạn sử dụng còn bao lâu?', 'Tối thiểu 6 tháng với nước ép, hồng sâm và 12 tháng với vitamin, canxi tại thời điểm giao. Hàng cận date (nếu có) luôn ghi rõ ở tên phân loại và giảm giá riêng.'],
    ['Đặt xong bao lâu thì nhận được hàng?', 'Nội thành Hà Nội: trong ngày (xác nhận trước 16h), hoả tốc 2–4 giờ. Tỉnh khác: 1–3 ngày làm việc. Xem Chính sách giao hàng.'],
    ['Tôi muốn xuất hoá đơn VAT?', 'Ghi thông tin công ty vào ô ghi chú khi đặt hàng hoặc báo khi xác nhận đơn. Hoá đơn điện tử gửi qua email trong 3 ngày làm việc.'],
    ['Tôi muốn đổi ý sau khi đặt hàng?', 'Huỷ hoặc đổi đơn miễn phí trước khi hàng được gửi đi; sau đó vẫn đổi được sang sản phẩm khác trong 7 ngày nếu hàng còn nguyên (mẹ chịu phí ship).'],
    ['Thông tin của tôi có bị chia sẻ cho ai không?', 'Không. Chỉ đơn vị vận chuyển nhận tên, SĐT, địa chỉ để giao hàng. Xem Chính sách bảo mật.'],
  ] },

  { key: 'cam-nang', group: 'about', icon: '📖', title: 'Cẩm nang chăm con', summary: 'Kiến thức chăm con theo tháng tuổi', link: 'blog.html' },
  { key: 'tra-cuu', group: 'about', icon: '🔎', title: 'Tra cứu đơn hàng', summary: 'Xem đơn gần đây, mua lại 1 chạm', html: `
<p>Cách 1 – Trên thiết bị đã đặt hàng: vào <a class="btn btn--primary btn--sm" href="account.html">Tài khoản → Đơn hàng gần đây</a> để xem mã đơn, sản phẩm, tổng tiền và bấm <b>Mua lại</b> chỉ với 1 chạm.</p>
<p>Cách 2 – Trên thiết bị khác hoặc muốn biết trạng thái giao hàng: nhắn <b>mã đơn</b> (dạng HCK…) hoặc số điện thoại đặt hàng cho Zalo <b>{zalo}</b>, chúng tôi trả lời trong giờ làm việc ({hours}).</p>
<p>Trạng thái đơn: <em>Đã tiếp nhận → Đã xác nhận → Đang giao → Đã giao</em>. Mẹ nhận thông báo qua Zalo/SMS ở mỗi bước.</p>` },
  { key: 'hop-tac', group: 'about', icon: '🤝', title: 'Liên hệ hợp tác', summary: 'Đại lý, cộng tác viên, nhà thuốc, mẹ & bé', html: `
<p>Hương Chất Kids tìm đối tác phân phối sản phẩm dinh dưỡng Hàn Quốc chính hãng:</p>
<ul><li><b>Đại lý / cửa hàng mẹ & bé, nhà thuốc</b>: chiết khấu theo doanh số, hỗ trợ tài liệu sản phẩm, tem phụ và hoá đơn đầy đủ.</li><li><b>Cộng tác viên online</b> (mẹ bỉm sữa, hội nhóm, TikTok/Facebook): hoa hồng theo đơn, không cần ôm hàng, có mã riêng.</li><li><b>Nhà cung cấp</b> muốn giới thiệu sản phẩm cho bé: gửi hồ sơ công bố, mẫu thử.</li></ul>
<h3>Liên hệ</h3>
<ul><li>Email: <a href="mailto:{email}?subject=Hợp tác với Hương Chất Kids">{email}</a> (tiêu đề "Hợp tác")</li><li>Hotline: {hotline} ({hours}) · Zalo: <a href="{zaloLink}" target="_blank" rel="noopener">Hương Chất Kids</a></li><li>Địa chỉ: {address}</li></ul>
<p>Vui lòng gửi: tên đơn vị/cá nhân, khu vực, kênh bán, sản phẩm quan tâm. Chúng tôi phản hồi trong 2 ngày làm việc.</p>` },
];
