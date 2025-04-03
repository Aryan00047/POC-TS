interface IButton{
    label: string;
    onClick: ()=> void;
    type: "button" | "submit";
}

function Button({label, onClick, type}: IButton){
    return(
        <button type={type} onClick={onClick}>{label}</button>
    )
}

export default Button;
