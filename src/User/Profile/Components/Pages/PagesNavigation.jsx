import './PagesNavigation.scss'

function PagesNavigation({ pages, openedPage, setOpenedPage }) {
    return (
        <div className="list-navigation-container">
            {
                pages.map((p, i) => {
                    return (
                        <p 
                            key={p}
                            className={`navigation-button ${openedPage == p ? 'selected' : ''}`}
                            onClick={(e) => {
                                setOpenedPage(p);
                            }}>
                            {p}
                        </p>
                    )
                })
            }
        </div>
    )
}

export default PagesNavigation;