import { useEffect, useRef, useState } from "react";
import { FaStar } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";
import { MdInfo } from "react-icons/md";
import { RiShieldFill } from "react-icons/ri";
import { FiClock } from "react-icons/fi";
import { AiFillFlag } from "react-icons/ai";
import { getBadges, getRunnersByPathway } from "consumer/runner";
import { timeConvert, timePowerTen } from "components/helpers/time";
import { getTracksByRunner } from "consumer/track";
import { useRouter } from "next/router";



const CardCatalog = ({ data }) => {
    const [runners, setRunners] = useState([])
    const [badges, setBadges] = useState([])
    const [estimate, setEstimate] = useState()
    const [tags, setTags] = useState(data.tags)

    const imagePathway = useRef()
    const levelPathway = useRef()
    const footerCard = useRef()
    const titleInfo = useRef()

    const router = useRouter()

    useEffect(() => {
        getRunnersByPathway(data.id).then(async (data) => {
            setRunners(data)
        })

        getBadges(data.id).then((data) => {
            setBadges(data)
        })

        if (tags.length > 3) {
            setTags(tags.splice(0, 3));
        }

        imagePathway.current.style.backgroundImage = `linear-gradient(rgba(0, 255, 231, 0.2), rgba(0, 255, 231, 0.2)), url(${data.image})`
        levelPathway.current.style.background = '#005249'
        footerCard.current.style.background = '#005249'
    }, [])

    useEffect(() => {
        const getEstimate = async () => {
            const estimates = []
            for (const runner of runners) {
                let tracks = await getTracksByRunner(runner.id);
                estimates.push({
                    estimation: tracks.map((el) => el.timeLimit).reduce((a, b) => a + b, 0),
                });
            }
            if (estimates) {
                const newEstimate = estimates.map((el) => el.estimation).reduce((acum, element) => acum + element, 0)
                setEstimate(newEstimate);
            }
        }
        if (!estimate) {
            getEstimate()
        }
    }, [runners])

    const showTitleInfo = () => {
        titleInfo.current.style.display = '-webkit-box'
    }

    const hideTitleInfo = () => {
        if (titleInfo.current.style.display === '-webkit-box')
            titleInfo.current.style.display = 'none'
    }

    const handlerMouseOver = () => {
        imagePathway.current.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3),rgba(0,0,0,0.3)), url(${data.image})`
    }

    const handlerMouseOut = () => {
        imagePathway.current.style.backgroundImage = `linear-gradient(rgba(0, 255, 231, 0.2), rgba(0, 255, 231, 0.2)), url(${data.image})`
    }

    const redirectPathway = (e) => {
        if (e.target.id !== "items-emblemas") {
            router.push("/catalog/pathway?id=" + data.id)
        }
    }

    const redirectEmplems = (e) => {
        router.push("/catalog/runners/?pathwayId=" + data.id)
    }

    return (
        <>
            <div className="card-catalog__container"
                onMouseOver={handlerMouseOver}
                onMouseOut={handlerMouseOut}
                onClick={redirectPathway}
            >
                <div className="card-catalog__header" ref={imagePathway} >
                    <div className="card-catalog__header-level" ref={levelPathway}>
                        {data.level}
                    </div>
                </div>
                <div className="card-catalog__body">
                    <div className="card-catalog__body-title">
                        <p className="card-catalog__body-title-text">
                            {data.name}
                        </p>
                        <MdInfo onMouseOver={showTitleInfo} />
                        <div className="card-catalog__body-title-info" ref={titleInfo}
                            onMouseLeave={hideTitleInfo}
                        >
                            <strong>Descripción:</strong>
                            <p>
                                {data.description}
                            </p>
                        </div>
                    </div>
                    <div className="card-catalog__body-detail">
                        <div className="card-catalog__body-detail-info">
                            <div className="card-catalog__body-detail-info-items">
                                <FaStar />
                                {data.average ? (
                                    <p>{data.average} De calificacion
                                        <div className="body-hiden-responsive"> promedio</div>
                                    </p>
                                ) : (
                                    <p>0 De calificacion
                                        <div className="body-hiden-responsive"> promedio</div>
                                    </p>
                                )}
                            </div>
                            <div className="card-catalog__body-detail-info-items">
                                <GiPathDistance />
                                <p>{runners.length} Rutas
                                    <div className="body-hiden-responsive">de Aprendizaje</div>
                                </p>
                            </div>
                            <div className="card-catalog__body-detail-info-items card-catalog__body-emblemas"
                                id="items-emblemas"
                                onClick={redirectEmplems}
                            >
                                <RiShieldFill id="items-emblemas" />
                                <p id="items-emblemas">{badges.length} Emblemas</p>
                            </div>
                            <div className="card-catalog__body-detail-info-items">
                                <FiClock />
                                {estimate && (
                                    <p>{timeConvert(timePowerTen(estimate))}</p>
                                )}
                            </div>
                            <div className="card-catalog__body-detail-info-items card-catalog__body-tags">
                                <AiFillFlag />
                                <div className="card-catalog__body-detail-info-tags">
                                    {tags.map((tags, index) => (
                                        <span key={index}>
                                            <p className="card-catalog__body-detail-info-tags-items">
                                                {tags}
                                            </p>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-catalog__body-accion">
                        <button className='card-catalog__body-accion-button' onClick={redirectPathway}>
                            Ver Ruta
                        </button>
                    </div>
                </div>
                <div className="card-catalog__footer" ref={footerCard}>
                    <p className="card-catalog__footer-text">
                        {data.teachingPath}
                    </p>
                </div>
            </div>
        </>
    );
};

export default CardCatalog;