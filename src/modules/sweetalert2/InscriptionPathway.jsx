import CardPathwayInscription from '@panely/components/sweetAlert/CardPathwayInscription'
import Carousel from '@panely/components/sweetAlert/Carousel'
import { Spinner } from '@panely/components'
import { getPathway } from 'consumer/pathway'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { getAssignments } from '../../consumer/assignments'
import { createJourney } from 'consumer/journey/createJourney'
import { getJourneyByUserAndPathway } from 'consumer/journey/journey'

const InscriptionPathway = ({ user }) => {
    const [pathways, setPathways] = useState([])
    const [load, setLoad] = useState(null)
    const [registeredJourney, setRegisteredJourney] = useState([])

    useEffect(() => {
        document.getElementById('swal2-content').classList.add('inscription-pathway__html')
        document.querySelector('.inscription-pathway__button').disabled = true
    }, [])

    useEffect(() => {
        if (user) {
            getData(user.uid)
        }
    }, [user])

    useEffect(() => {
        if (pathways.length && pathways.length === registeredJourney.length) {
            document.querySelector('.inscription-pathway__button').disabled = false
        }
    }, [registeredJourney])


    const getData = async (uid) => {
        const assignedPathways = await getAssignments(uid)
        assignedPathways.map(pathway => {
            getJourneyByUserAndPathway(user, pathway.id).then(data => {
                if (data) {
                    setRegisteredJourney(element => {
                        element.push(data)
                        return element
                    })
                }
            })
            getPathway(
                pathway.id,
                (data) => {
                    setPathways(element => {
                        element.push({
                            infoPathway: data,
                            assignedGroup: pathway.group
                        })
                        return element
                    })
                    if (pathways.length === assignedPathways.length) {
                        setLoad(true)
                    }
                },
                () => {
                    console.error("Sucedio un error");
                }
            );
        })
    }

    const registerPathway = async ({ infoPathway, assignedGroup }) => {
        const data = await createJourney(infoPathway.id, user, assignedGroup)
        setRegisteredJourney(element => element.concat(data))
        return data
    }

    return (
        <>
            {!load ? (
                <div className="container d-flex align-items-center justify-content-center h-100 w-100">
                    <Spinner />
                </div>
            ) : (
                <>
                    <div className='inscription-pathway__content-header'>
                        <p>
                            Bienvenido <b>{user.displayName}</b>, según tu ruta de aprendizaje,
                            existen algunos pathways  a los cuales no te has inscrito
                        </p>
                    </div>
                    <Carousel height={70}>
                        {pathways.map((pathway, index) => (
                            <CardPathwayInscription
                                key={index}
                                infoPathway={pathway}
                                journey={registeredJourney.filter(journey => journey.pathwayId === pathway.infoPathway.id)}
                                header={pathway.infoPathway.name}
                                image={pathway.infoPathway.image}
                                textContent={pathway.infoPathway.description}
                                textButton={`Inscribirse`}
                                onClickButton={registerPathway}
                            />
                        ))}

                    </Carousel>
                    <div className='inscription-pathway__content-footer'>
                        <p>Te sugerimos que estas inscripciones se hagan lo antes posible
                            de esta manera estarás mas pronto a cumplir tu meta</p>
                    </div>
                </>
            )}

        </>
    )
}

// function mapStateToProps(state) {
//     return {
//         user: state.user,
//     };
// }


// export default connect(
//     mapStateToProps,
//     null
// )(InscriptionPathway);

export default InscriptionPathway;