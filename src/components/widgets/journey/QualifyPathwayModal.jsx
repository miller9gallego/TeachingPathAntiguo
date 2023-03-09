import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import { Modal, Spinner } from "@panely/components";
import React from "react";
import { useRef } from "react";
import { useState } from "react"
import { useEffect } from "react";
import { updateQualify } from "consumer/pathway";

const QualifyPathwayModal = ({ isOpenModal, pathwayId, user, setQualify = () => { } }) => {
    const [isOpen, setIsOpen] = useState(true)
    const [points, setPoints] = useState(0)
    const [isLoad, setIsLoad] = useState(true)
    const comment = useRef('')
    const error = useRef()
    const errorLenght = useRef()
    const starOne = useRef()
    const starTwo = useRef()
    const starThree = useRef()
    const starFour = useRef()
    const starFive = useRef()
    const buttonSend = useRef()

    useEffect(() => {
        setTimeout(() => {
            buttonSend.current.disabled = true
        }, 500)
    }, [])

    const toggle = () => {
        setIsOpen(false)
        isOpenModal()
    }

    const paintStar = (position) => {
        if (position === starOne) {
            starOne.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
        }

        if (position === starTwo) {
            starOne.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starTwo.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
        }

        if (position === starThree) {
            starOne.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starTwo.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starThree.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
        }

        if (position === starFour) {
            starOne.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starTwo.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starThree.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starFour.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
        }

        if (position === starFive) {
            starOne.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starTwo.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starThree.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starFour.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starFive.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
        }
    }

    const unPaintStar = (position) => {
        if (starOne === position) {
            starOne.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
        }

        if (position === starTwo) {
            starOne.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starTwo.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
        }

        if (position === starThree) {
            starOne.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starTwo.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starThree.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
        }

        if (position === starFour) {
            starOne.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starTwo.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starThree.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starFour.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
        }

        if (position === starFive) {
            starOne.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starTwo.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starThree.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starFour.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
            starFive.current.children[0].classList.toggle('modal-pathway-qualify__start-background')
        }
    }

    const countPoints = (position) => {
        buttonSend.current.disabled = false
        if (position === 1) {
            setPoints(1)
            starOne.current.children[0].classList.add('modal-pathway-qualify__start-background-click')
            starTwo.current.children[0].classList.remove('modal-pathway-qualify__start-background-click')
            starThree.current.children[0].classList.remove('modal-pathway-qualify__start-background-click')
            starFour.current.children[0].classList.remove('modal-pathway-qualify__start-background-click')
            starFive.current.children[0].classList.remove('modal-pathway-qualify__start-background-click')
        }
        if (position === 2) {
            setPoints(2)
            starOne.current.children[0].classList.add('modal-pathway-qualify__start-background-click')
            starTwo.current.children[0].classList.add('modal-pathway-qualify__start-background-click')
            starThree.current.children[0].classList.remove('modal-pathway-qualify__start-background-click')
            starFour.current.children[0].classList.remove('modal-pathway-qualify__start-background-click')
            starFive.current.children[0].classList.remove('modal-pathway-qualify__start-background-click')
        }
        if (position === 3) {
            setPoints(3)
            starOne.current.children[0].classList.add('modal-pathway-qualify__start-background-click')
            starTwo.current.children[0].classList.add('modal-pathway-qualify__start-background-click')
            starThree.current.children[0].classList.add('modal-pathway-qualify__start-background-click')
            starFour.current.children[0].classList.remove('modal-pathway-qualify__start-background-click')
            starFive.current.children[0].classList.remove('modal-pathway-qualify__start-background-click')
        }
        if (position === 4) {
            setPoints(4)
            starOne.current.children[0].classList.add('modal-pathway-qualify__start-background-click')
            starTwo.current.children[0].classList.add('modal-pathway-qualify__start-background-click')
            starThree.current.children[0].classList.add('modal-pathway-qualify__start-background-click')
            starFour.current.children[0].classList.add('modal-pathway-qualify__start-background-click')
            starFive.current.children[0].classList.remove('modal-pathway-qualify__start-background-click')
        }
        if (position === 5) {
            setPoints(5)
            starOne.current.children[0].classList.add('modal-pathway-qualify__start-background-click')
            starTwo.current.children[0].classList.add('modal-pathway-qualify__start-background-click')
            starThree.current.children[0].classList.add('modal-pathway-qualify__start-background-click')
            starFour.current.children[0].classList.add('modal-pathway-qualify__start-background-click')
            starFive.current.children[0].classList.add('modal-pathway-qualify__start-background-click')
        }
    }

    const validateChange = () => {
        if (comment.current.value.length > 0) {
            error.current.hidden = true
        }
        if (comment.current.value.length >= 5) {
            errorLenght.current.hidden = true
        }
    }

    const qualifyPathway = () => {
        if (!comment.current.value) {
            error.current.hidden = false
        }
        if (comment.current.value && comment.current.value.length < 5) {
            errorLenght.current.hidden = false
        }

        if (comment.current.value && comment.current.value.length >= 5) {
            setIsLoad(false)
            updateQualify(pathwayId,
                {
                    userId: user.uid,
                    userName: user.displayName || user.firstName + " " + user.lastName,
                    avatar: user.image,
                    points: points,
                    comment: comment.current.value,
                    createAt: new Date()
                })
                .then((doc) => {
                    toggle()
                    setIsLoad(true)
                    setQualify(true)
                })
        }
    }

    return (
        <>
            <Modal isOpen={isOpen} toggle={toggle} className='container-modal-pathway-qualify' contentClassName='modal-pathway-qualify' >
                <Modal.Body className="modal-pathway-qualify__body" >

                    <p className="modal-pathway-qualify__close" onClick={toggle}>
                        <FontAwesomeIcon icon={SolidIcon.faPlusCircle} style={{ transform: "rotate(45deg)" }} />
                    </p>
                    <h1 className="modal-pathway-qualify__title">¡Lo estas haciendo Excelente!</h1>
                    <div className="modal-pathway-qualify__container-text">
                        <p className="modal-pathway-qualify__text">
                            ¿Comó Calificas este pathway?
                        </p>
                        <p className="modal-pathway-qualify__text">
                            Déjanos tu comentario
                        </p>
                    </div>
                    <div className="modal-pathway-qualify__starts">
                        <FontAwesomeIcon
                            icon={SolidIcon.faStar}
                            className='modal-pathway-qualify__start'
                            ref={starOne}
                            onMouseOver={(e) => paintStar(starOne)}
                            onMouseOut={(e) => unPaintStar(starOne)}
                            onClick={(e) => countPoints(1)}
                        />
                        <FontAwesomeIcon
                            icon={SolidIcon.faStar}
                            className='modal-pathway-qualify__start'
                            ref={starTwo}
                            onMouseOver={(e) => paintStar(starTwo)}
                            onMouseOut={(e) => unPaintStar(starTwo)}
                            onClick={(e) => countPoints(2)}
                        />
                        <FontAwesomeIcon
                            icon={SolidIcon.faStar}
                            className='modal-pathway-qualify__start'
                            ref={starThree}
                            onMouseOver={(e) => paintStar(starThree)}
                            onMouseOut={(e) => unPaintStar(starThree)}
                            onClick={(e) => countPoints(3)}
                        />
                        <FontAwesomeIcon
                            icon={SolidIcon.faStar}
                            className='modal-pathway-qualify__start'
                            ref={starFour}
                            onMouseOver={(e) => paintStar(starFour)}
                            onMouseOut={(e) => unPaintStar(starFour)}
                            onClick={(e) => countPoints(4)}
                        />
                        <FontAwesomeIcon
                            icon={SolidIcon.faStar}
                            className='modal-pathway-qualify__start'
                            ref={starFive}
                            onMouseOver={(e) => paintStar(starFive)}
                            onMouseOut={(e) => unPaintStar(starFive)}
                            onClick={(e) => countPoints(5)}
                        />
                    </div>
                    <textarea type="text"
                        placeholder="Dejanos tu Comentario"
                        className="modal-pathway-qualify__textarea"
                        ref={comment}
                        onChange={validateChange}
                    />
                    <p hidden={true} ref={error} className='modal-pathway-qualify__error'>Agrega un comentario por favor</p>
                    <p hidden={true} ref={errorLenght} className='modal-pathway-qualify__error'>Agrega un comentario con mas de 5 caracteres</p>
                    <div className="d-flex justify-content-center">
                        <button
                            hidden={!isLoad}
                            ref={buttonSend}
                            className="modal-pathway-qualify_button"
                            onClick={qualifyPathway}
                        >
                            Enviar
                        </button>
                        <Spinner
                            hidden={isLoad}
                            type="border"
                            variant="primary"
                            className="modal-pathway-qualify__spinner"
                        />
                    </div>

                </Modal.Body>
            </Modal>
        </>
    )
}

export default QualifyPathwayModal