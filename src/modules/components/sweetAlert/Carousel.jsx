import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from 'react'
import { useRef } from 'react';

const Carousel = ({ children, height }) => {
    const carousel = useRef()
    const buttonNext = useRef()
    const buttonAfter = useRef()

    useEffect(() => {
        if (carousel.current.children.length <= 2) {
            carousel.current.style.justifyContent = 'space-evenly'
            buttonNext.current.style.display = 'none'
            buttonAfter.current.style.display = 'none'
            if (carousel.current.children[1])
                carousel.current.children[1].classList.add('seleccionado')
            carousel.current.children[0].classList.add('seleccionado')

        } else {
            if (carousel.current.children.length % 2 === 0) {
                carousel.current.style.transform = 'translateX(20%)'
            }
            carousel.current.children[Math.round(carousel.current.children.length / 2) - 1].classList.add('seleccionado')
        }

    }, [])


    const afterSlide = () => {
        if (carousel.current.children.length > 2) {
            let cloneSlide = null
            const lastSlide = carousel.current.children[carousel.current.children.length - 1]
            carousel.current.children[Math.round(carousel.current.children.length / 2) - 1].classList.remove('seleccionado')

            if (carousel.current.children.length === 3) {
                cloneSlide = lastSlide.cloneNode(true)
                carousel.current.insertBefore(cloneSlide, carousel.current.firstChild)
                carousel.current.style.transform = 'translateX(-20%)'
                setTimeout(() => {
                    carousel.current.style.transition = '1000ms ease-out transform'
                    carousel.current.style.transform = 'translateX(20%)'
                    carousel.current.addEventListener('transitionend', replacePositionSlide)
                }, 100)
            } else {

                if (carousel.current.children.length === 4) {
                    cloneSlide = lastSlide.cloneNode(true)
                    carousel.current.insertBefore(cloneSlide, carousel.current.firstChild)
                    carousel.current.style.transform = 'translateX(0%)'
                }
                setTimeout(() => {
                    if (carousel.current.children.length % 2 === 0 && carousel.current.children.length > 4) {
                        carousel.current.style.transition = '1000ms ease-out transform'
                        carousel.current.style.transform = 'translateX(60%)'
                    } else {
                        carousel.current.style.transition = '1000ms ease-out transform'
                        carousel.current.style.transform = 'translateX(40%)'
                    }
                    carousel.current.addEventListener('transitionend', replacePositionSlide)
                }, 100);

            }


            const replacePositionSlide = () => {
                if (cloneSlide) {
                    carousel.current.removeChild(cloneSlide)
                    carousel.current.insertBefore(lastSlide, carousel.current.firstChild)
                    carousel.current.style.transition = 'none'

                    if (carousel.current.children.length === 3) {
                        carousel.current.style.transform = 'translateX(0%)'
                    } else {
                        carousel.current.style.transform = 'translateX(20%)'
                    }

                } else {
                    carousel.current.insertBefore(lastSlide, carousel.current.firstChild)
                    carousel.current.style.transition = 'none'
                    if (carousel.current.children.length % 2 === 0) {
                        carousel.current.style.transform = 'translateX(20%)'
                    } else {
                        carousel.current.style.transform = 'translateX(0%)'
                    }
                }
                carousel.current.children[Math.round(carousel.current.children.length / 2) - 1].classList.add('seleccionado')
                carousel.current.removeEventListener('transitionend', replacePositionSlide)
            }

        }
    }


    const nextSlide = () => {
        let cloneSlide = null

        if (carousel.current.children.length > 2) {
            const firstSlide = carousel.current.children[0]

            if (carousel.current.children.length === 3) {
                cloneSlide = firstSlide.cloneNode(true)
                carousel.current.appendChild(cloneSlide)
                carousel.current.style.transform = 'translateX(20%)'
                carousel.current.children[Math.round(carousel.current.children.length / 2) - 1].classList.remove('seleccionado')
                setTimeout(() => {
                    carousel.current.style.transition = '1000ms ease-out transform'
                    carousel.current.style.transform = 'translateX(-20%)'
                    carousel.current.addEventListener('transitionend', replacePositionSlide)
                }, 100)
            } else {
                carousel.current.children[Math.round(carousel.current.children.length / 2) - 1].classList.remove('seleccionado')

                if (carousel.current.children.length % 2 === 0) {
                    carousel.current.style.transition = '1000ms ease-out transform'
                    carousel.current.style.transform = 'translateX(-20%)'
                } else {
                    carousel.current.style.transition = '1000ms ease-out transform'
                    carousel.current.style.transform = 'translateX(-40%)'
                }

                setTimeout(() => {

                    carousel.current.addEventListener('transitionend', replacePositionSlide)
                }, 100)
            }

            const replacePositionSlide = () => {

                if (cloneSlide) {
                    carousel.current.removeChild(cloneSlide)
                    carousel.current.appendChild(firstSlide)
                    carousel.current.style.transition = 'none'
                    carousel.current.style.transform = 'translateX(0%)'
                } else {
                    carousel.current.appendChild(firstSlide)
                    carousel.current.style.transition = 'none'
                    if (carousel.current.children.length % 2 === 0) {
                        carousel.current.style.transform = 'translateX(20%)'
                    } else {
                        carousel.current.style.transform = 'translateX(0%)'
                    }
                }

                carousel.current.children[Math.round(carousel.current.children.length / 2) - 1].classList.add('seleccionado')
                carousel.current.removeEventListener('transitionend', replacePositionSlide)
            }

        }

    }

    return (
        <>
            <div className={`carousel__container carousel__container-height-${height}`}>
                <div className="carousel__container-body" ref={carousel}>
                    {!children.length ? (
                        <div className="carousel__item seleccionado">
                            {children}
                        </div>
                    ) :
                        (
                            <>
                                {
                                    children.map((element, index) => (
                                        <div key={index} className="carousel__item">
                                            {element}
                                        </div>
                                    ))
                                }
                            </>
                        )
                    }
                </div>
                <button className='carousel__button carousel__button-left' onClick={afterSlide} ref={buttonAfter}>
                    <FontAwesomeIcon
                        icon={SolidIcon.faAngleLeft}
                    />
                </button>
                <button className='carousel__button carousel__button-right' onClick={nextSlide} ref={buttonNext}>
                    <FontAwesomeIcon
                        icon={SolidIcon.faAngleRight}
                    />
                </button>
            </div>
        </>
    )
}

export default Carousel