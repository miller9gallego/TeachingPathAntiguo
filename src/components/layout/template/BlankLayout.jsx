import { Layout } from "@panely/components"
import Footer from "components/layout/part/Footer"



function BlankLayout({ children }) {
    return (
        <Layout className="holder road-background">
            <Layout type="wrapper">
                <Layout type="content">
                    {children}
                </Layout>
                <Footer from={true} />
            </Layout>
        </Layout>
    )
}

export default BlankLayout
