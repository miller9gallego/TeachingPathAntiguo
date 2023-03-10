import Carousel from "@panely/slick";
import { CarouselItem } from "@panely/components";
import { getBadges, getBadgesByUser } from "consumer/journey/journey";
import Portlet from "@panely/components/Portlet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";

class BadgeListComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: [] };
    }

    componentDidMount() {
        if (this.props.journeyId) {
            getBadges(
                this.props.journeyId,
                (data) => {
                    const list = data.data.sort((a, b) => {
                        if (a.disabled) {
                            return 1;
                        }
                        if (b.disabled) {
                            return -1;
                        }
                        return 0;
                    });
                    this.setState({ data: list });
                },
                () => {
                }
            );
        } else {
            const user = this.props.user;
            getBadgesByUser(user,
                (data) => {
                    this.setState(data);
                },
                () => {
                }
            );
        }
    }

    render() {
        const tolta = this.state.data.length;
        const inComplete = this.state.data.filter(
            (data) => data.disabled === false
        ).length;

        return (
            <Portlet className="rounded-top">
                <Portlet.Header>
                    <Portlet.Icon>
                        <FontAwesomeIcon icon={SolidIcon.faCertificate} />
                    </Portlet.Icon>
                    <Portlet.Title>
                        Emblemas{" "}
                        {this.props.journeyId
                            ? "(" + inComplete + "/" + tolta + ")"
                            : "(" + tolta + ")"}
                    </Portlet.Title>
                </Portlet.Header>
                <Portlet.Body className="list">
                    <div className="mt-4">
                        {this.state.data.length === 0 && (
                            <p className="text-center text-muted">
                                No hay emblemas para este pathway.
                            </p>
                        )}
                        {this.state.data.length !== 0 && (
                            <Carousel
                                slidesToShow={
                                    this.state.data.length >= 4 ? 4 : this.state.data.length
                                }
                            >
                                {this.state.data.map((data, index) => {
                                    return (
                                        <CarouselItem key={"badge-key" + index}>
                                            <center
                                                title={!data.disabled ? data.description : undefined}
                                                style={{
                                                    cursor: "pointer",
                                                    background: data.disabled ? "#f5f5f5" : "#fff",
                                                }}
                                                className={"p-2"}
                                            >
                                                <img
                                                    style={{
                                                        width: "125px",
                                                        opacity: data.disabled ? "0.3" : "1",
                                                    }}
                                                    className={
                                                        data.disabled
                                                            ? "bg-white mg-thumbnail avatar-circle p-2 border border-warning"
                                                            : "bg-yellow mg-thumbnail avatar-circle p-2 border border-success"
                                                    }
                                                    src={data.image}
                                                    alt="Badge Image"
                                                />
                                                <p>
                                                    <strong>
                                                        {data.disabled ? "NO DISPONIBLE" : data.name}
                                                    </strong>
                                                </p>
                                            </center>
                                        </CarouselItem>
                                    );
                                })}
                            </Carousel>
                        )}
                    </div>
                </Portlet.Body>
            </Portlet>
        );
    }
}

export default BadgeListComponent;
