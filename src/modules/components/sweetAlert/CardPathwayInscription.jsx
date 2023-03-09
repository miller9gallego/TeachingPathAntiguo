import React, { useEffect, useRef } from 'react'
import * as SolidIcon from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spinner } from '@panely/components'
import { useState } from 'react'

const CardPathwayInscription = ({ header, image, textContent, textButton, onClickButton, infoPathway, journey, registeredJourney }) => {
    const [loading, setLoading] = useState(false)

    const imageHeader = useRef()
    const checkIcon = useRef()
    const inscriptionButton = useRef()

    useEffect(() => {
        if (journey.length) {
            checkIcon.current.style.display = 'inline-block'
            inscriptionButton.current.style.display = 'none'
        }
        imageHeader.current.style.backgroundImage = `url(${image})`
    }, [])

    useEffect(() => {
        setLoading(false)
    }, [registeredJourney])

    const handleClick = () => {
        setLoading(true)
        onClickButton(infoPathway).then(() => {
            setLoading(false)
            checkIcon.current.style.display = 'inline-block'
            inscriptionButton.current.style.display = 'none'
        })
    }

    return (
        <div className="card-pathway-inscription_item">
            <div ref={imageHeader} className="card-pathway-inscription_header">
                <h4 className="my-0 text-light font-weight-normal mb-3">
                    {header}
                </h4>
                <svg
                    className='card-pathway-inscription_img'
                    enableBackground='new 0 0 300 100'
                    height='50px'
                    id='Layer_1'
                    preserveAspectRatio='none'
                    version='1.1'
                    viewBox='0 0 300 100'
                    width='300px'
                    x='0px' >
                    <path
                        className='deco-layer deco-layer--1'
                        d='M30.913,43.944c0,0,42.911-34.464,87.51-14.191c77.31,35.14,113.304-1.952,146.638-4.729c48.654-4.056,69.94,16.218,69.94,16.218v54.396H30.913V43.944z'
                        fill='#FFFFFF'
                        opacity='0.6'
                    />
                    <path
                        className='deco-layer deco-layer--2'
                        d='M-35.667,44.628c0,0,42.91-34.463,87.51-14.191c77.31,35.141,113.304-1.952,146.639-4.729c48.653-4.055,69.939,16.218,69.939,16.218v54.396H-35.667V44.628z'
                        fill='#FFFFFF'
                        opacity='0.6'
                    />
                    <path
                        className='deco-layer deco-layer--3'
                        d='M43.415,98.342c0,0,48.283-68.927,109.133-68.927c65.886,0,97.983,67.914,97.983,67.914v3.716H42.401L43.415,98.342z'
                        fill='#FFFFFF'
                        opacity='0.7'
                    />
                    <path
                        className='deco-layer deco-layer--4'
                        d='M-34.667,62.998c0,0,56-45.667,120.316-27.839C167.484,57.842,197,41.332,232.286,30.428c53.07-16.399,104.047,36.903,104.047,36.903l1.333,36.667l-372-2.954L-34.667,62.998z'
                        fill='#FFFFFF'
                    />
                </svg>
            </div>
            <div className="card-pathway-inscription_body bg-white mt-0 shadow">
                <div className="card-pathway-inscription_body-content">
                    <p>
                        {textContent}
                    </p>
                </div>
                <FontAwesomeIcon ref={checkIcon} icon={SolidIcon.faCheckCircle} color={'#008037'} width={20} className='card-pathway-inscription_body-check' />
                <div className="card-pathway-inscription_body-button">
                    {loading ? (
                        <Spinner />
                    ) : (
                        <button
                            ref={inscriptionButton}
                            onClick={handleClick}
                            className='modal-pathway-qualify_button card-pathway-inscription_button'
                        >
                            {textButton}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CardPathwayInscription