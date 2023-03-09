import { Widget4, } from "@panely/components";


export function TrackDisplay(props) {
    const { title, highlight, ...attributes } = props;

    return (
        <Widget4 {...attributes}>
            <Widget4.Group>
                <Widget4.Display>
                    <Widget4.Subtitle children={title} />
                    <Widget4.Highlight children={highlight} />
                </Widget4.Display>
            </Widget4.Group>
        </Widget4>
    );
}