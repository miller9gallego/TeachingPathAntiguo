import { Widget4, } from "@panely/components";


export function WidgetDisplay(props) {
    const { title, body, ...attributes } = props;

    return (
        <Widget4 {...attributes}>
            <Widget4.Group>
                <Widget4.Display>
                    <Widget4.Highlight children={title} />
                    <Widget4.Subtitle children={body} />
                </Widget4.Display>
            </Widget4.Group>
        </Widget4>
    );
}