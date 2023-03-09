import { Footer } from "@panely/components";

function FooterComponent({ from }) {
    const copyrightYear = new Date().getFullYear();

    return (
        <>
            <Footer>
                {from && (
                    <div className="footer-container">
                        <div className='marca'>
                            <p>Un producto</p>
                            <img src="/images/sofka-make.png" alt="logo make simple" />
                            <img src="/images/Sofkau-sin-fondo.png" alt="sofka U" className='marca__img-sofkau' />
                        </div>
                    </div>
                )}
                <div className="newFooter d-flex justify-content-center">
                    <p className="newFooter-text">
                        Copyright <i className="fas fa-copyright" />{" "}
                        <span>{copyrightYear}</span> Teaching Path.{" "}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://docs.teachingpath.info/"
                        >
                            Ver más información
                        </a>
                    </p>
                </div>
            </Footer>
        </>
    );
}

export default FooterComponent;
