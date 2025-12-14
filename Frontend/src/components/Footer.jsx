export default function Footer(){
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="foot-left">© {new Date().getFullYear()} MedLink — Secure patient bookings</div>
        <div className="foot-right">Privacy · Terms · Contact</div>
      </div>
    </footer>
  )
}
