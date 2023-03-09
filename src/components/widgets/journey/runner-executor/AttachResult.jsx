import Attach from './Attach'

const AttachResult = (props) => {
    return (
        <span className="float-left mr-1">
            {
                {
                    training: <Attach {...props} />,
                    hacking: <Attach {...props} />,
                    questions: <Attach {...props} />,
                }[props.item.type]
            }
        </span>
    );
};

export default AttachResult;