import { Button, CardColumns, Col, Container, Portlet, Dropdown, Row, ButtonGroup, Input, CustomInput, } from "@panely/components";
import { breadcrumbChange, pageChangeHeaderTitle } from "store/actions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import withLayout from "components/layout/withLayout";
import Head from "next/head";
import Router from "next/router";
import Spinner from "@panely/components/Spinner";
import { searchPathways } from "consumer/catalog";
import { groupBy } from "components/helpers/array";
import CardCatalog from "@panely/components/journey/CardCatalog";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BsFilter } from 'react-icons/bs';


class CatalogPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: null, filter: [] };
        this.filtersKeys = []
    }


    filterRoute(key) {
        let array = this.state.data[key]
        if (this.state.filter.length > 0) {
            this.setState({
                filter: [...this.state.filter,
                { title: key, routs: array }]
            });
            localStorage.setItem('filterRoute', JSON.stringify([...this.state.filter, { title: key, routs: array }]))
        } else {
            this.setState({ filter: [{ title: key, routs: array }] });
            localStorage.setItem('filterRoute', JSON.stringify([{ title: key, routs: array }]));
        };
    }
    clearFilterRoutes() {
        localStorage.setItem('filterRoute', 'null');
        this.setState({ filter: [] });
    }



    componentDidMount() {
        const q = Router.query.q;
        const tags = Router.query.tag;
        const hasFavorite = JSON.parse(localStorage.getItem('filterRoute'));
        if (hasFavorite !== null) { this.setState({ filter: hasFavorite }) }
        this.props.pageChangeHeaderTitle("Pathways");
        this.props.breadcrumbChange([{ text: "Catálogo", link: "/catalog" }]);
        searchPathways(
            tags,
            q,
            (list) => {
                this.setState({
                    data: groupBy(list.data, "teachingPath"),
                });
            },
            () => {
            }
        );
    }

    render() {


        if (this.state.data === null) {
            return <Spinner className="m-5">Cargando...</Spinner>;
        }
        return (
            <React.Fragment>
                <Head>
                    <title>Pathway | Teaching Path</title>
                    <script src="/script.js"></script>
                </Head>
                <Container fluid className="portlet">
                    <Col md="12">
                        <Portlet.Header className="catalog-header">
                            <div className="catalog">
                                <FontAwesomeIcon className="catalog-icon-route" icon={SolidIcon.faRoute} />
                                <div className="catalog__content">
                                    <div className="catalog__content-header">
                                        <h4 className="catalog__content-header-title">Pathways disponibles</h4>
                                        {
                                            this.state.filter.length > 0 ? (
                                                this.state.filter.map((item, index) => {
                                                    return (
                                                        <></>
                                                        // <Button key={index} className="mr-2 btn btn-flat-light">
                                                        //     {item.title}
                                                        // </Button>
                                                    )
                                                })
                                            ) : (
                                                <Button variant="primary" className="mr-2 d-none">
                                                    Favorita
                                                </Button>
                                            )
                                        }
                                        <Dropdown.Uncontrolled>
                                            <Dropdown.Toggle className="catalog__content-header-filter">
                                                <BsFilter className="svg-inline--fa" />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu animated>
                                                {Object.keys(this.state.data).map((key, index) => {
                                                    return (
                                                        <Dropdown.Item
                                                            key={index}
                                                            id={key}
                                                            onClick={() => this.filterRoute(key)}
                                                            disabled={this.state.filter.some(item => item.title === key) ? true : false}
                                                        >
                                                            {key}
                                                        </Dropdown.Item>
                                                    )
                                                })}
                                                <Dropdown.Divider />
                                                <Dropdown.Item onClick={() => { this.clearFilterRoutes() }}>Borrar filtro</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown.Uncontrolled>
                                    </div>
                                    <p className="catalog__content-text">
                                        Puede ver los Pathways aquí, pero para postularse debe tener
                                        una cuenta de usuario.
                                    </p>
                                </div>
                            </div>
                        </Portlet.Header>
                        <Portlet.Body className="catalog__cards-container">
                            {Object.keys(this.state.data).length === 0 && (
                                <p className="p-5">No hay coincidencias para mostrar.</p>
                            )}
                            {this.state.filter.length === 0 ?
                                Object.keys(this.state.data).map((key, index) => {
                                    return (
                                        <>
                                            <CardColumns key={index} className="catalog__cards-columns" >
                                                {
                                                    this.state.data[key].map((data, index) => {
                                                        return (
                                                            <CardCatalog
                                                                data={data}
                                                                key={"pathwayId-" + index}
                                                            />
                                                        );
                                                    })
                                                }
                                            </CardColumns>
                                        </>
                                    );
                                }) : this.state.filter.map((filter, index) => {
                                    return (
                                        <Row key={index}>
                                            <h3>{filter.title}</h3>
                                            <CardColumns>
                                                {filter.routs.map((route, index) => {
                                                    return (
                                                        <CardCatalog data={route} key={"pathwayId-" + index} />
                                                    )
                                                })
                                                }</CardColumns>
                                        </Row>
                                    )
                                }
                                )
                            }
                        </Portlet.Body>
                    </Col>
                </Container>
            </React.Fragment >
        );
    }
}

function mapDispathToProps(dispatch) {
    return bindActionCreators(
        { pageChangeHeaderTitle, breadcrumbChange },
        dispatch
    );
}

export default connect(
    null,
    mapDispathToProps
)(withLayout(CatalogPage, "public"));
