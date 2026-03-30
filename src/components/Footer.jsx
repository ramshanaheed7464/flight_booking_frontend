import { Plane } from 'lucide-react';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer-root">
            <div className="footer-brand"><Plane size={14} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} /> AeroLink</div>
            <div className="footer-links">
                <a href="#">About</a>
                <a href="#">Privacy</a>
                <a href="#">Support</a>
            </div>
            <div className="footer-copy">© {new Date().getFullYear()} AeroLink. All rights reserved.</div>
        </footer>
    );
}