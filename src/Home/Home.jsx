import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import './Home.scss'
import Post from './Post/Post';

async function getFeed() {
    const response = await api.get('feed');

    return response.data;
}

function Home() {

    const { data, error, isLoading } = useQuery({
        queryKey: ['feed'],
        queryFn: () => getFeed(),
    })

    if (error) return;
    if (isLoading) return;

    console.log(data);

    return (
        <div className="home-wrapper">
            <div className="home-container">
                {
                    data.map((p, i) => {
                        return (
                            <Post
                                key={p.id}
                                data={p}/>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default Home;