import { Button, Progress, Widget1 } from '@panely/components';
import Router from "next/router";
import React from 'react'

const StatusProgressStart = ({ progress, journeyId }) => {
    return (
        <Widget1.Group>
            <Widget1.Title>
                Progress
                <Progress striped variant="secondary" value={progress} className="mr-5 w-50">
                    {progress}%
                </Progress>
            </Widget1.Title>
            <Widget1.Addon>
                <Button
                    className="btn btn-light"
                    onClick={() => {
                        Router.push({
                            pathname: "/catalog/journey",
                            query: {
                                id: journeyId,
                            },
                        });
                    }}
                >
                    Ir al journey
                </Button>
            </Widget1.Addon>
        </Widget1.Group>
    );
};

export default StatusProgressStart