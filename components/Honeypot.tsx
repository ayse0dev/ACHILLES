export default function Honeypot() {
    return (
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
        </div>
    );
}
