// All components stylesheets
import "styles/core/reboot.scss";
import "styles/components/index.scss";
import "styles/quill/core.scss";
import "styles/quill/snow.scss";
import "styles/quill/bubble.scss";
import "styles/apexcharts/index.scss";
import "styles/simplebar/index.scss";
import "styles/sortablejs/sortablejs.scss";
import "styles/sweetalert2/index.scss";
import "styles/slick-carousel/index.scss";
import "rc-steps/assets/index.css";
import "styles/quiz/styles.css";
import "styles/pages/index.scss"
import "react-datepicker/dist/react-datepicker.css";
import 'react-calendar-heatmap/dist/styles.css';


import { AuthProvider } from "components/firebase/firebaseAuth";
import { bindActionCreators } from "redux";
import { pageChangeTheme } from "store/actions";
import { wrapper } from "store";
import { connect } from "react-redux";
import DefaultLayout from "components/layout/template/DefaultLayout";
import BlankLayout from "components/layout/template/BlankLayout";
import PublicLayout from "components/layout/template/PublicLayout";
import ProgressBar from "@panely/progressbar";
import App from "next/app";

class MyApp extends App {

    componentDidMount() {

        const darkModeActive = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        if (localStorage.getItem('theme') !== null) {

            const theme = localStorage.getItem('theme');
            this.props.pageChangeTheme(theme);

        } else {
            this.props.pageChangeTheme(darkModeActive ? 'dark' : 'light');
        }

        const { firebase } = this.props.pageProps

        if (!firebase) {
            document.body.classList.add("theme-login");
        } else {
            document.body.classList.remove("theme-login");
        }

    }


    componentDidUpdate(prevProps) {

        window.matchMedia("(prefers-color-scheme: dark)")
            .addEventListener('change', (e) => {

                this.props.pageChangeTheme(e.matches ? 'dark' : 'light');
            })

        if (this.props.theme !== prevProps.theme) {
            // Toggling theme body class
            if (this.props.theme === "dark") {
                document.body.classList.remove("theme-light");
                document.body.classList.add("theme-dark");
            } else {
                document.body.classList.remove("theme-dark");
                document.body.classList.add("theme-light");
            }
        }

        if (this.props !== prevProps) {
            const { firebase } = this.props.pageProps
            if (!firebase) {
                document.body.classList.add("theme-login");
            } else {
                document.body.classList.remove("theme-login");
            }
        }

    }

    render() {
        const { Component, pageProps } = this.props;

        switch (pageProps.layout) {
            case "blank":
                return (
                    <AuthProvider>
                        <BlankLayout>
                            <ProgressBar />
                            <Component {...pageProps} />
                        </BlankLayout>
                    </AuthProvider>
                );
            case "public":
                return (
                    <PublicLayout>
                        <ProgressBar />
                        <Component {...pageProps} />
                    </PublicLayout>
                );
            case "default":
            default:
                return (
                    <AuthProvider>
                        <DefaultLayout>
                            <ProgressBar />
                            <Component {...pageProps} />
                        </DefaultLayout>
                    </AuthProvider>
                );
        }
    }
}

function mapStateToProps(state) {
    return {
        theme: state.page.theme,
        user: state.user,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({ pageChangeTheme }, dispatch),
    };
}

export default wrapper.withRedux(
    connect(mapStateToProps, mapDispatchToProps)(MyApp)
);
