interface RoleLabelProps {
    role: string;
}

const RoleLabel: React.FC<RoleLabelProps> = ({ role }) => {
    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'customer':
                return 'bg-blue-100 text-blue-800';
            case 'service provider':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
            {role}
        </span>
    );
};

export default RoleLabel; 