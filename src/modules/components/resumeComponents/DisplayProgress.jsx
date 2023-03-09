import { Progress, Widget4, } from "@panely/components";


export function DisplayProgress(props) {
    const { title, highlight, progress, ...attributes } = props;

    return (
        <Widget4 {...attributes}>
            <Widget4.Group>
                <Widget4.Display>
                    <Widget4.Subtitle children={title} />
                </Widget4.Display>
                <Widget4.Addon>
                    <Widget4.Subtitle children={highlight} />
                </Widget4.Addon>
            </Widget4.Group>
            <Progress value={progress} variant="primary" />
        </Widget4>
    );
}