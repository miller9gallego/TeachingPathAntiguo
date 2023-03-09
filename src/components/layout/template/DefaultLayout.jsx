import {Layout} from "@panely/components"
import SidemenuSetting from "components/layout/part/SidemenuSetting"
import Scrolltop from "components/layout/part/Scrolltop"
import Footer from "components/layout/part/Footer"
import Header from "components/layout/part/Header"
import PAGE from "config/page.config"



class DefaultLayout extends React.Component {
    render() {
        const {
            enableHeader,
            enableFooter,
            enableScrolltop,
        } = PAGE.layout
        const {children} = this.props

        return (
            <Layout type="holder">
                <Layout type="wrapper">
                    {enableHeader ? <Header/> : null}
                    <Layout type="content">
                        {children}
                    </Layout>
                    {enableFooter ? <Footer/> : null}
                </Layout>
                {enableScrolltop ? <Scrolltop/> : null}
                {enableHeader ? <SidemenuSetting/> : null}
            </Layout>
        )
    }
}

export default DefaultLayout
