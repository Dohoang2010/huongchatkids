/* =====================================================================
   NỘI DUNG HỖ TRỢ & CHÍNH SÁCH – Hương Chất Kids
   Mỗi mục: key (dùng trong URL policy.html?p=key), group, title, icon, summary, html.
   Placeholder {hotline} {zalo} {email} {address} {company} {freeship} {shipFee} {expressFee} {hours}
   được thay tự động từ SITE. Cập nhật ngày 21/09/2026.
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

  { key: 'thanh-toan', group: 'support', icon: '💳', title: 'Phương thức thanh toán', summary: 'Thanh toán khi nhận hàng hoặc chuyển khoản VietQR, hoá đơn VAT', html: `
<p>Giá bán hiển thị bằng <b>Đồng Việt Nam (₫)</b>, đã bao gồm thuế giá trị gia tăng, chưa bao gồm phí vận chuyển (xem <a href="policy.html?p=giao-hang">Chính sách giao hàng</a>). Mẹ chọn một trong <b>2 hình thức</b> sau:</p>
<h3>1. Thanh toán khi nhận hàng (COD)</h3>
<ul><li>Áp dụng toàn quốc. Mẹ trả tiền mặt cho nhân viên giao hàng sau khi <b>kiểm tra hàng</b> (ngoại quan, tem phụ, hạn dùng, số lượng).</li><li>Được từ chối nhận nếu hàng sai, móp rách, không đúng đơn – không mất phí.</li></ul>
<h3>2. Chuyển khoản ngân hàng / VietQR</h3>
<table class="ptable"><tr><th>Ngân hàng</th><td>{bankFull}</td></tr><tr><th>Số tài khoản</th><td><b>{bankAccount}</b></td></tr><tr><th>Chủ tài khoản</th><td>{bankHolder}</td></tr><tr><th>Nội dung chuyển khoản</th><td><b>TÊN MẸ_thanhtoan_MÃ ĐƠN</b> (ví dụ: NGUYEN THU HA_thanhtoan_HCK260921123)</td></tr></table>
<ul><li>Ngay sau khi bấm Đặt hàng, màn hình hiện <b>mã VietQR</b> đã điền sẵn số tiền và nội dung – mẹ mở app ngân hàng/ví bất kỳ, quét và xác nhận, không cần gõ tay. Mã QR cũng xem lại được tại <a href="policy.html?p=tra-cuu">Tra cứu đơn hàng</a>.</li><li>Đây là <b>số tài khoản duy nhất</b> của Hương Chất Kids. Chúng tôi không bao giờ nhắn số tài khoản khác hay yêu cầu chuyển cho cá nhân; nếu nhận được yêu cầu như vậy, mẹ gọi hotline {hotline} để xác minh.</li><li>Đơn được giao ngay khi nhận được tiền (thường trong vài phút với chuyển khoản nhanh 24/7).</li></ul>
<h3>Hoá đơn giá trị gia tăng</h3>
<p>Hoá đơn điện tử được xuất theo Nghị định 123/2020/NĐ-CP khi mẹ yêu cầu (ghi thông tin xuất hoá đơn ở ô ghi chú hoặc báo khi xác nhận đơn). Hoá đơn được gửi qua email trong vòng 3 ngày làm việc kể từ khi giao hàng thành công.</p>
<h3>An toàn thanh toán</h3>
<ul><li>Website <b>không lưu</b> thông tin thẻ hay tài khoản ngân hàng của khách hàng.</li><li>Mọi giao dịch chuyển khoản đều qua ngân hàng được Ngân hàng Nhà nước cấp phép.</li><li>Nếu chuyển nhầm hoặc chuyển thừa, chúng tôi hoàn lại trong 1–3 ngày làm việc sau khi đối chiếu.</li></ul>` },

  { key: 'giao-hang', group: 'support', icon: '🚚', title: 'Chính sách giao hàng', summary: 'Khu vực, thời gian, phí ship, freeship từ {freeship}, đồng kiểm', html: `
<h3>Phạm vi & thời gian giao</h3>
<table class="ptable"><tr><th>Khu vực</th><th>Thời gian dự kiến</th><th>Ghi chú</th></tr>
<tr><td>Nội thành Hà Nội</td><td>Trong ngày (đơn xác nhận trước 16h), muộn nhất ngày làm việc tiếp theo</td><td>Có <b>hoả tốc 2–4 giờ</b>, phụ thu {expressFee}</td></tr>
<tr><td>Ngoại thành Hà Nội, TP.HCM, các thành phố lớn</td><td>1–2 ngày làm việc</td><td>Qua đơn vị vận chuyển</td></tr>
<tr><td>Các tỉnh khác</td><td>2–3 ngày làm việc; vùng sâu, hải đảo 3–5 ngày</td><td>Có thể chậm hơn vào dịp lễ, Tết, mưa bão</td></tr></table>
<p>Thời gian trên tính từ khi đơn được xác nhận và (với đơn chuyển khoản) đã nhận thanh toán. Chúng tôi chủ động thông báo nếu dự kiến giao chậm hơn.</p>
<h3>Phí vận chuyển</h3>
<ul><li><b>{shipFee}/đơn</b> toàn quốc, hiển thị rõ trước khi mẹ bấm Đặt hàng.</li><li><b>Miễn phí vận chuyển</b> cho đơn từ <b>{freeship}</b> (tính trên giá trị sau giảm giá).</li><li>Hoả tốc nội thành Hà Nội: phụ thu {expressFee}.</li></ul>
<h3>Đóng gói</h3>
<p>Sản phẩm được bọc chống sốc, thùng nước ép/hồng sâm đóng thùng carton riêng, dán niêm phong của Hương Chất Kids. Hàng lạnh/nhạy nhiệt (nếu có) được đóng túi giữ nhiệt.</p>
<h3>Kiểm tra hàng khi nhận (đồng kiểm)</h3>
<p>Mẹ có quyền <b>mở kiện kiểm tra ngoại quan, số lượng, tem phụ và hạn dùng trước khi thanh toán COD</b>, có sự chứng kiến của nhân viên giao hàng. Nếu hàng móp, rách, thiếu, sai: mẹ từ chối nhận, không mất phí; chúng tôi giao lại hoặc hoàn tiền trong 3 ngày làm việc.</p>
<h3>Giao không thành công</h3>
<ul><li>Đơn vị vận chuyển liên hệ tối đa 3 lần trong 3 ngày. Nếu không liên lạc được, hàng được hoàn về kho; chúng tôi liên hệ mẹ để giao lại (miễn phí lần 2 nếu do lỗi vận chuyển).</li><li>Với đơn đã thanh toán trước mà mẹ không nhận, tiền hàng được hoàn lại sau khi trừ phí vận chuyển thực tế (nếu có), thông báo rõ trước khi trừ.</li></ul>
<h3>Trách nhiệm</h3>
<p>Theo Điều 34 Luật Bảo vệ quyền lợi người tiêu dùng 2023 và Điều 33 Nghị định 52/2013/NĐ-CP, chúng tôi chịu trách nhiệm về hàng hoá cho đến khi mẹ nhận và xác nhận; rủi ro hư hỏng, mất mát trong quá trình vận chuyển do Hương Chất Kids và đơn vị vận chuyển chịu.</p>` },

  { key: 'doi-tra', group: 'support', icon: '🔄', title: 'Chính sách đổi trả & hoàn tiền', summary: 'Đổi trả miễn phí 7 ngày, hoàn tiền 3–5 ngày làm việc', html: `
<h3>Trường hợp được đổi / trả</h3>
<p>Trong <b>7 ngày</b> kể từ ngày nhận hàng, mẹ được đổi hoặc trả <b>miễn phí</b> khi:</p>
<ul><li>Giao sai sản phẩm, sai phân loại (vị, quy cách), thiếu số lượng so với đơn.</li><li>Sản phẩm lỗi do nhà sản xuất: bao bì phồng, rò rỉ, vón cục, mùi lạ, thiếu tem phụ.</li><li>Bao bì móp, rách, bể vỡ do vận chuyển.</li><li>Hạn sử dụng khi giao còn dưới 3 tháng (trừ hàng cận date đã ghi rõ và giảm giá riêng).</li><li>Sản phẩm không đúng mô tả, hình ảnh, thông tin công bố trên website.</li></ul>
<h3>Trường hợp không áp dụng</h3>
<ul><li>Sản phẩm đã mở nắp/mở gói, đã sử dụng (trừ trường hợp lỗi nhà sản xuất được phát hiện sau khi mở).</li><li>Quá 7 ngày kể từ ngày nhận hàng.</li><li>Sản phẩm hư hỏng do bảo quản không đúng hướng dẫn sau khi nhận.</li><li>Mẹ đổi ý sau khi đã nhận hàng và sản phẩm còn nguyên: chúng tôi vẫn hỗ trợ <b>đổi sang sản phẩm khác</b> trong 7 ngày, mẹ chịu phí vận chuyển.</li></ul>
<h3>Cách thực hiện</h3>
<ol><li>Chụp ảnh/quay video sản phẩm và tem phụ, gửi Zalo <b>{zalo}</b> hoặc email <b>{email}</b> kèm mã đơn trong vòng 7 ngày.</li><li>Chúng tôi phản hồi <b>trong 24 giờ làm việc</b> và hướng dẫn: gửi hàng đổi mới tới tận nơi hoặc thu hồi hàng cũ.</li><li>Hương Chất Kids chịu toàn bộ phí vận chuyển hai chiều với các trường hợp lỗi thuộc về chúng tôi.</li></ol>
<h3>Hoàn tiền</h3>
<ul><li>Hoàn <b>100% giá trị sản phẩm</b> (và phí vận chuyển đã trả nếu lỗi do chúng tôi).</li><li>Hình thức: chuyển khoản vào tài khoản mẹ cung cấp hoặc hoàn về ví điện tử đã thanh toán.</li><li>Thời gian: trong <b>3–5 ngày làm việc</b> kể từ khi nhận lại hàng hoặc xác nhận lỗi qua ảnh/video (không cần trả hàng với hàng bể vỡ).</li></ul>
<h3>Bảo hành chất lượng</h3>
<p>Sản phẩm là thực phẩm, không có bảo hành theo nghĩa hàng điện máy; chúng tôi bảo đảm chất lượng đến hết hạn sử dụng ghi trên bao bì khi bảo quản đúng hướng dẫn. Chính sách này tuân thủ Điều 30–31 Luật Bảo vệ quyền lợi người tiêu dùng 2023 về trách nhiệm đổi, trả, hoàn tiền đối với hàng hoá có khuyết tật.</p>
<h3>Khiếu nại</h3>
<p>Nếu chưa hài lòng với cách giải quyết, mẹ gửi khiếu nại tới email {email}; chúng tôi trả lời bằng văn bản trong 7 ngày làm việc. Mẹ cũng có quyền khiếu nại tới Sở Công Thương Hà Nội hoặc Hội Bảo vệ người tiêu dùng theo quy định.</p>` },

  { key: 'bao-mat', group: 'support', icon: '🔒', title: 'Chính sách bảo mật thông tin', summary: 'Thu thập gì, dùng để làm gì, quyền của mẹ (NĐ 13/2023)', html: `
<p>Chính sách này được xây dựng theo <b>Nghị định 13/2023/NĐ-CP</b> về bảo vệ dữ liệu cá nhân và Điều 68–73 Nghị định 52/2013/NĐ-CP về thương mại điện tử.</p>
<h3>1. Mục đích và phạm vi thu thập</h3>
<p>Khi mẹ đặt hàng, yêu cầu gọi lại hoặc đăng ký nhận ưu đãi, chúng tôi thu thập: <b>họ tên, số điện thoại, địa chỉ nhận hàng</b>; <b>email</b> (nếu cần hoá đơn); <b>nội dung ghi chú</b> mẹ cung cấp (ví dụ độ tuổi, cân nặng của bé để tư vấn). Chúng tôi <b>không</b> thu thập thông tin thẻ ngân hàng, mật khẩu ví, hay dữ liệu định vị.</p>
<p>Mục đích: xác nhận và giao đơn hàng, xuất hoá đơn, tư vấn sử dụng sản phẩm, xử lý đổi trả/khiếu nại, và (nếu mẹ đồng ý) gửi thông tin ưu đãi, nhắc lịch bổ sung dinh dưỡng cho bé.</p>
<h3>2. Phạm vi sử dụng</h3>
<ul><li>Chỉ nhân viên bán hàng, tư vấn và kế toán của Hương Chất Kids được truy cập để thực hiện các mục đích trên.</li><li>Chia sẻ cho <b>đơn vị vận chuyển</b> (tên, SĐT, địa chỉ) để giao hàng; cho <b>cơ quan nhà nước có thẩm quyền</b> khi có yêu cầu bằng văn bản theo pháp luật.</li><li>Không bán, cho thuê, trao đổi dữ liệu cá nhân cho bất kỳ bên thứ ba nào khác.</li></ul>
<h3>3. Thời gian lưu trữ</h3>
<p>Dữ liệu đơn hàng được lưu tối đa <b>24 tháng</b> kể từ giao dịch cuối để phục vụ đổi trả, hoá đơn, chăm sóc sau bán; sau đó được xoá hoặc ẩn danh, trừ trường hợp pháp luật về kế toán yêu cầu lưu lâu hơn.</p>
<h3>4. Dữ liệu lưu trên thiết bị của mẹ</h3>
<p>Website lưu giỏ hàng và thông tin giao hàng gần nhất <b>trên trình duyệt của mẹ</b> (localStorage) để lần sau điền sẵn. Dữ liệu này không được gửi về máy chủ cho tới khi mẹ bấm Đặt hàng, và mẹ có thể xoá bất cứ lúc nào tại <a href="account.html">Tài khoản → Xoá thông tin đã lưu</a>. Website không dùng cookie theo dõi quảng cáo của bên thứ ba.</p>
<h3>5. Quyền của mẹ (chủ thể dữ liệu)</h3>
<ul><li>Được biết, truy cập, chỉnh sửa, yêu cầu xoá dữ liệu cá nhân của mình.</li><li>Rút lại sự đồng ý nhận tin nhắn ưu đãi bất kỳ lúc nào (nhắn "DUNG" tới Zalo hoặc gọi hotline).</li><li>Khiếu nại về việc xử lý dữ liệu tới chúng tôi hoặc cơ quan có thẩm quyền (Cục An ninh mạng và phòng, chống tội phạm sử dụng công nghệ cao – Bộ Công an).</li></ul>
<p>Yêu cầu gửi tới email <b>{email}</b> hoặc hotline {hotline}; chúng tôi xử lý trong <b>72 giờ</b> kể từ khi nhận yêu cầu hợp lệ.</p>
<h3>6. Bảo mật</h3>
<p>Dữ liệu được lưu trên hệ thống có mật khẩu, phân quyền và mã hoá đường truyền (HTTPS). Khi phát hiện sự cố rò rỉ, chúng tôi thông báo cho mẹ và cơ quan chức năng trong 72 giờ theo quy định.</p>
<h3>7. Dữ liệu trẻ em</h3>
<p>Thông tin về bé (tuổi, cân nặng) chỉ được ghi nhận khi mẹ chủ động cung cấp để tư vấn, được xử lý như dữ liệu cá nhân nhạy cảm với sự đồng ý của cha mẹ/người giám hộ theo Điều 20 Nghị định 13/2023/NĐ-CP.</p>
<h3>8. Đơn vị chịu trách nhiệm</h3>
<p>{company} – {address} – Hotline {hotline} – Email {email}.</p>` },

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
<h3>Sản phẩm</h3>
<ul><li>Nước ép hoa quả – rau củ hữu cơ Lotte (Pasteur Hàn Quốc), dùng được từ 6 tháng.</li><li>Hồng sâm trẻ em ChuChu, gạc hươu non Sumo Kids.</li><li>Vitamin D3K2 Pure Vitality (New Zealand), canxi hữu cơ Calciumore.</li><li>Rong biển rắc cơm Sung Gyung, Busan; nghệ nano Korea365 cho mẹ.</li></ul>
<h3>Cách chúng tôi làm việc</h3>
<ul><li>Nhập khẩu chính ngạch, đầy đủ tem phụ tiếng Việt và số công bố; hoá đơn VAT theo yêu cầu.</li><li>Tư vấn 1:1 miễn phí qua Zalo/điện thoại trước và sau khi mua: bé mấy tháng dùng được, liều bao nhiêu, kết hợp thế nào.</li><li>Bán trên website này và gian hàng Shopee chính thức với cùng chính sách.</li></ul>
<h3>Thông tin liên hệ</h3>
<ul><li>Địa chỉ: {address}</li><li>Hotline / Zalo: {hotline} ({hours})</li><li>Email: {email}</li></ul>
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
    ['Giá trên web và trên Shopee có giống nhau không?', 'Giá cơ bản giống nhau. Trên web mẹ được thêm ưu đãi mua từ 2 giảm 3%, mã HCK10 và miễn phí vận chuyển cho đơn từ {freeship}.'],
    ['Hạn sử dụng còn bao lâu?', 'Tối thiểu 6 tháng với nước ép, hồng sâm và 12 tháng với vitamin, canxi tại thời điểm giao. Hàng cận date (nếu có) luôn ghi rõ ở tên phân loại và giảm giá riêng.'],
    ['Đặt xong bao lâu thì nhận được hàng?', 'Nội thành Hà Nội: trong ngày (xác nhận trước 16h), hoả tốc 2–4 giờ. Tỉnh khác: 1–3 ngày làm việc. Xem Chính sách giao hàng.'],
    ['Tôi muốn xuất hoá đơn VAT?', 'Ghi thông tin công ty vào ô ghi chú khi đặt hàng hoặc báo khi xác nhận đơn. Hoá đơn điện tử gửi qua email trong 3 ngày làm việc.'],
    ['Tôi muốn đổi ý sau khi đặt hàng?', 'Huỷ hoặc đổi đơn miễn phí trước khi hàng được gửi đi; sau đó vẫn đổi được sang sản phẩm khác trong 7 ngày nếu hàng còn nguyên (mẹ chịu phí ship).'],
    ['Thông tin của tôi có bị chia sẻ cho ai không?', 'Không. Chỉ đơn vị vận chuyển nhận tên, SĐT, địa chỉ để giao hàng. Xem Chính sách bảo mật.'],
  ] },

  { key: 'cam-nang', group: 'about', icon: '📖', title: 'Cẩm nang mẹ', summary: 'Kiến thức chăm con theo tháng tuổi', link: 'blog.html' },
  { key: 'tra-cuu', group: 'about', icon: '🔎', title: 'Tra cứu đơn hàng', summary: 'Xem đơn gần đây, mua lại 1 chạm', html: `
<p>Cách 1 – Trên thiết bị đã đặt hàng: vào <a class="btn btn--primary btn--sm" href="account.html">Tài khoản → Đơn hàng gần đây</a> để xem mã đơn, sản phẩm, tổng tiền và bấm <b>Mua lại</b> chỉ với 1 chạm.</p>
<p>Cách 2 – Trên thiết bị khác hoặc muốn biết trạng thái giao hàng: nhắn <b>mã đơn</b> (dạng HCK…) hoặc số điện thoại đặt hàng cho Zalo <b>{zalo}</b>, chúng tôi trả lời trong giờ làm việc ({hours}).</p>
<p>Trạng thái đơn: <em>Đã tiếp nhận → Đã xác nhận → Đang giao → Đã giao</em>. Mẹ nhận thông báo qua Zalo/SMS ở mỗi bước.</p>` },
  { key: 'hop-tac', group: 'about', icon: '🤝', title: 'Liên hệ hợp tác', summary: 'Đại lý, cộng tác viên, nhà thuốc, mẹ & bé', html: `
<p>Hương Chất Kids tìm đối tác phân phối sản phẩm dinh dưỡng Hàn Quốc chính hãng:</p>
<ul><li><b>Đại lý / cửa hàng mẹ & bé, nhà thuốc</b>: chiết khấu theo doanh số, hỗ trợ tài liệu sản phẩm, tem phụ và hoá đơn đầy đủ.</li><li><b>Cộng tác viên online</b> (mẹ bỉm sữa, hội nhóm, TikTok/Facebook): hoa hồng theo đơn, không cần ôm hàng, có mã riêng.</li><li><b>Nhà cung cấp</b> muốn giới thiệu sản phẩm cho bé: gửi hồ sơ công bố, mẫu thử.</li></ul>
<h3>Liên hệ</h3>
<ul><li>Email: <a href="mailto:{email}?subject=Hợp tác với Hương Chất Kids">{email}</a> (tiêu đề "Hợp tác")</li><li>Zalo / Hotline: {zalo} – {hotline} ({hours})</li><li>Địa chỉ: {address}</li></ul>
<p>Vui lòng gửi: tên đơn vị/cá nhân, khu vực, kênh bán, sản phẩm quan tâm. Chúng tôi phản hồi trong 2 ngày làm việc.</p>` },
];
