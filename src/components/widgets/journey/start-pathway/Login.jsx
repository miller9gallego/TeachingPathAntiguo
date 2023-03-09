import Button from '@panely/components/Button';
import React from 'react'

const Login = () => {
    return (
        <div className="d-flex justify-content-center">
            <Button
                className="w-50 btn-light"
                onClick={() => {
                    Router.push({
                        pathname: "/login",
                        query: {
                            redirect: window.location.href,
                        },
                    });
                }}
            >
                Iniciar Pathway
            </Button>
        </div>
    );
};

export default Login