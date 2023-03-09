import {Header, Button} from "@panely/components";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { sidemenuToggle, userChange} from "store/actions";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import HeaderBreadcrumb from "./HeaderBreadcrumb";
import HeaderSearch from "./HeaderSearch";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import Sticky from "react-stickynode";
import HeaderNav from "./HeaderNav";
import HeaderUser from "./HeaderUser";
import { firebaseClient, firestoreClient } from "components/firebase/firebaseClient";
import { getUser } from "consumer/user";
import { useEffect, useState } from "react";



function HeaderComponent(props) {
    const {headerTitle, sidemenuToggle, userChange} = props;
    const [user, setUser] = useState(null)
    
    useEffect(()=>{
        firebaseClient.auth().onAuthStateChanged((fireUser) =>{
        if(fireUser){     
            getUser(fireUser.uid, ({data})=>{
                setUser({...data, uid: fireUser.uid});
                userChange({...data, uid: fireUser.uid})
            });
            
        }
    });
    },[])
    
    
    
    //console.log(fireUser, user)

    return (
        <Header>
            <Sticky
                enabled={true}
                top={0}
                bottomBoundary={0}
                className="sticky-header"
            >
                <Header.Holder desktop>
                    <Header.Container fluid justify="between">
                        <Header.Wrap justify="between" className="w-100">
                        <Header.Wrap justify="start" className="pr-3">
                            <Header.Brand>
                                <a href="/">
                                    <img
                                        src="/images/logo.png"
                                        alt="teaching path"
                                        style={{height: "58px"}}
                                    />
                                </a>

                            </Header.Brand>
                        </Header.Wrap>
                       
                        {user !== null?  
                           (<Header.Wrap justify="end" className="w-75"> 
                                <HeaderSearch className="mr-2" bootstrapWidth={'w-50'}/>
                                <HeaderNav user={user}/>                      
                                <Button
                                    icon
                                    variant="label-primary"
                                    className="ml-2"
                                    onClick={()=> {sidemenuToggle('setting');}}
                                    
                                >
                                    <FontAwesomeIcon icon={SolidIcon.faCog}/>
                                </Button>
                                <HeaderUser user={user}/>
                            
                            </Header.Wrap>) 
                            : 
                            <Header.Wrap block>
                                <HeaderSearch bootstrapWidth={'w-100'}/>                            
                            </Header.Wrap>}
                        </Header.Wrap>
                    </Header.Container>
                </Header.Holder>
                <Header.Holder mobile>
                    <Header.Container fluid>
                        <Header.Wrap justify="between" className="w-100">
                        <Header.Wrap justify="start" className="pr-3">
                            <Header.Brand>
                                <a href="/">
                                    <img
                                        src="/images/icon.png"
                                        alt="teaching path"
                                        style={{height: "25px"}}
                                    />
                                </a>

                            </Header.Brand>
                        </Header.Wrap>
                        {user? 
                        (<Header.Wrap justify="end">
                            <HeaderSearch/>                            
                            <HeaderUser user={user}/>
                        </Header.Wrap>)
                        :
                        (<Header.Wrap block>
                            <HeaderSearch bootstrapWidth={'w-100'}/>    
                        </Header.Wrap>)
                        }
                        
                        </Header.Wrap>
                    </Header.Container>
                </Header.Holder>
            </Sticky>
            <Header.Holder>
                <Header.Container fluid>
                    <Header.Title children={headerTitle}/>
                    <Header.Divider/>
                    <Header.Wrap block justify="start">
                        <HeaderBreadcrumb/>
                    </Header.Wrap>
                </Header.Container>
            </Header.Holder>
        </Header>
    );
}

function mapStateToProps(state) {
    return {
        headerTitle: state.page.headerTitle,
        user: state.user,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({sidemenuToggle, userChange}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(HeaderComponent);
