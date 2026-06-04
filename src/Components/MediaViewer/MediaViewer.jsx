import './MediaViewer.scss'

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules'

import 'swiper/css';
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { icons } from '../../assets/icons/icons';
import { useRef } from 'react';

function MediaViewer({ mediaItems, buttons }) {
    const prevButtonRef = useRef(null);
    const nextButtonRef = useRef(null);

    return (
        <div className="media-viewer-wrapper">
            <button className="prev-button"
                ref={prevButtonRef}>
                <img src={icons.arrowLeft} alt="" />
            </button>
            
            <button className="next-button"
                ref={nextButtonRef}>
                <img src={icons.arrowRight} alt="" />
            </button>

            <Swiper
                noSwiping={true}
                modules={[Navigation, Pagination]}
                spaceBetween={50}
                slidesPerView={1}
                navigation={{
                    prevEl: prevButtonRef.current,
                    nextEl: nextButtonRef.current,
                }}
                onSwiper={(swiper) => {
                    swiper.params.navigation.prevEl = prevButtonRef.current;
                    swiper.params.navigation.nextEl = nextButtonRef.current;
                    swiper.navigation.destroy();
                    swiper.navigation.init();
                    swiper.navigation.update();
                    swiper.pagination.destroy();
                    if (swiper.slides.length > 1) {
                        swiper.pagination.init();
                        swiper.pagination.update();
                    }
                }}
                onSlideChange={(swiper) => {
                    swiper.pagination.destroy();
                    if (swiper.slides.length > 1) {
                        swiper.pagination.init();
                        swiper.pagination.update();
                    }
                }}
                pagination={{ clickable: true }}>
                {
                    mediaItems && 
                    mediaItems.map((item, index) => {
                        return (
                            <SwiperSlide
                                key={item.id}>
                                <div className={`media-wrapper`}>
                                    {
                                        !!buttons && buttons.length > 0 &&
                                        <div className="slide-buttons">
                                            {
                                                buttons.map((button, index) => {
                                                    return (
                                                        <button
                                                            key={index}
                                                            className={button?.className ?? ''}
                                                            onClick={() => {
                                                                if (button?.onClick)
                                                                    button?.onClick(item, index)
                                                            }}>
                                                            {button?.textContent}
                                                        </button>
                                                    )
                                                })
                                            }
                                        </div>
                                    }
                                    {item.type === 'image' &&
                                        <div className="background-container">
                                                <img className='image-blur' src={item.src} alt="Reddit content" loading="lazy" />
                                        </div>
                                    }
                                    <div className='content-container'>
                                        {item.type === 'image' ? (
                                            <img src={item.src} alt="Image content" loading="lazy" />
                                        ) : (
                                            <video src={item.src} controls muted playsInline />
                                        )}
                                    </div>
                                </div>
                            </SwiperSlide>
                        )
                    })
                }
            </Swiper>
        </div>
    )
}

export default MediaViewer;