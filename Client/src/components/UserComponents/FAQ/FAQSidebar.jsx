import pdp from './../images/pdp.jpg';
import { Link } from 'react-router-dom';

const FAQSidebar = () => {
    return (
        <div className="faq-sidebar">
            <Link to="/SkillShareHub/saved">
                <button className='faq-sidebar-button'>
                    📌 Saved
                </button>
            </Link>
            <h2>🔥 Trending Questions</h2>
            <ul className='faq-sideBar-Trending'>
                <li>What’s the best JS framework?</li>
                <li>How do I start coding?</li>
                <li>Best resources for backend dev?</li>
            </ul>
            <h2>🏆 Top Contributors</h2>
            <ul className='faq-sideBar-Contributors'>
                <li><img src={pdp} alt="User" /><span>Marzouk Houssem Eddine</span></li>
                <li><img src={pdp} alt="User" /><span>Aziz Rajhi</span></li>
            </ul>
        </div>
    );
};

export default FAQSidebar;
