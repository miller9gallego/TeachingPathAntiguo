import { Marker, Portlet, Timeline } from "@panely/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import Spinner from "@panely/components/Spinner";
import { getActivitiesForGroup } from "consumer/user";
import Calendar from "@panely/calendar-heatmap";

class ActivitiesComponent extends React.Component {
    state = { data: null };

    componentDidMount() {
        getActivitiesForGroup(
            this.props.group,
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
            <Portlet>
                <Portlet.Header>
                    <Portlet.Icon>
                        <FontAwesomeIcon icon={SolidIcon.faClipboardList} />
                    </Portlet.Icon>
                    <Portlet.Title>Actividades de la Sala</Portlet.Title>
                </Portlet.Header>
                <Portlet.Body className="list scroll" style={{ overflowY: "auto", maxHeight: "650px" }}>
                    {this.state.data === null && <Spinner />}
                    {this.state.data && this.state.data.length === 0 && (
                        <p className="text-center">No hay activiades aún.</p>
                    )}
                    {this.state.calendar && <Calendar calendar={this.state.calendar} months={this.props.months} />}
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
