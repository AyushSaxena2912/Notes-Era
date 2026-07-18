import header from "./Header.module.css";

const Header = () => {
  return (
    <header className={`${header.wrapper}`}>
      <div className="container py-4 d-flex flex-wrap gap-4 align-items-center justify-content-around">
        <a href="/">
          <img
            src="/Assets2/lightLogo.png"
            alt="NotesEra Logo"
            width={106}
            height={46}
          />
        </a>
        <nav>
          <ul className="list-unstyled d-flex gap-3 gap-sm-5 m-0">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="mailto:noteseraa@gmail.com">Contact Us</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
