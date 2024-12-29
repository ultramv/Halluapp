import { PageProps } from '@/types';
import DesktopWelcome from './Desktop';
import MobileWelcome from './Mobile';

export default function Welcome(props: PageProps) {
    return (
        <>
            <MobileWelcome {...props} />
            <DesktopWelcome {...props} />
        </>
    );
} 