import Mobile from './Mobile';
import Desktop from './Desktop';
import { User } from '@/types';

interface Props {
    auth: {
        user: User | null;
    };
    currentRoute?: string;
}

export default function Welcome(props: Props) {
    return (
        <>
            <div className="block md:hidden">
                <Mobile authUser={props.auth} currentRoute={props.currentRoute} />
            </div>
            <div className="hidden md:block">
                <Desktop {...props} />
            </div>
        </>
    );
} 