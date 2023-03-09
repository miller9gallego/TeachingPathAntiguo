import { Marker, Portlet, Timeline } from "@panely/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import Spinner from "@panely/components/Spinner";
import { getActivities } from "consumer/user";
import Calendar from "@panely/calendar-heatmap";

class ActivitiesComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: null };
    }

    componentDidMount() {
        getActivities(
            this.props.firebase.user_id,
            this.props.filterByGroup,
            (data) => {
                const lastItem = data.data[data.data.length - 1];
                const firstItem = data.data[0];
                const values = data.data
                    .map((item) => {
                        return item.date.toDateString();
                    })
                    .reduce(function (prev, cur) {
                        prev[cur] = (prev[cur] || 0) + 1;
                        return prev;
                    }, {});

                this.setState({
                    data: data.data,
                    calendar: {
                        startDate: lastItem.date,
                        endDate: firstItem.date,
                        values: Object.keys(values).map((a) => ({
                            date: a,
                            count: values[a],
                        })),
                    },
                });
            },
            () => {
            }
        );
    }

    render() {
        return (
            <Portlet className="rounded">
                <Portlet.Header>
                    <Portlet.Icon>
                        <FontAwesomeIcon icon={SolidIcon.faClipboardList} />
                    </Portlet.Icon>
                    <Portlet.Title>Actividades recientes</Portlet.Title>
                </Portlet.Header>
                <Portlet.Body className="list" style={{ overflowY: "auto", maxHeight: "750px" }}>
                    {this.state.data === null && <Spinner />}
                    {this.state.data && this.state.data.length === 0 && (
                        <p className="text-center">No hay actividadedes en este momento</p>
                    )}
                    {this.state.calendar &&
                        <Calendar calendar={this.state.calendar} horizontal={this.props.horizontal} months={this.props.months} />}

                    <Timeline timed>
                        {this.state.data &&
                            this.state.data.map((data, index) => {
                                const { time, date, color, content: Content } = data;

                                return (
                                    <Timeline.Item
                                        key={index}
                                        date={date}
                                        time={time}
                                        pin={<Marker type="circle" variant={color} />}
                                    >
                                        <Content />
                                    </Timeline.Item>
                                );
                            })}
                    </Timeline>
                </Portlet.Body>
            </Portlet>
        );
    }
}

export default ActivitiesComponent;
