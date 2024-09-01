
// import { useState } from 'react';

interface UserFilterProps {
    onClick: () => void;
    onClickGenBtn: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isDisabled: boolean;
    params: {distance?:number, limited?:number, datetime?:string, interval?:string};
}


const UserFilter = ({onClick, params, onChange, onClickGenBtn, isDisabled}: UserFilterProps) => {
    return (
        <>
            <div className="card mx-auto m-3" style={{width:"30rem"}}>
                <div className="card-body">
                    <div className="form-group">
                        <label>datetime</label>
                        <input type="datetime-local" name="datetime" className="form-control" value={params.datetime} onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>interval(minute)</label>
                        <input type="number" name="interval" className="form-control" value={params.interval} min="10" step="10" onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>distance(meter)</label>
                        <input type="number" id="distance" name="distance" className="form-control" min="1" max="200" value={params.distance} onChange={onChange}/>
                    </div>
                    {/* <div className="form-group">
                        <label>limited</label>
                        <input type="number" id="limited" name="limited" className="form-control" min="1" max="100" value={params.limited} onChange={onChange}/>
                    </div> */}
                    <button className="btn btn-primary mt-2" onClick={onClick}>Search</button>
                </div>
                <div className="card-footer d-flex flex-row-reverse">
                    <button className={isDisabled ? "btn btn-link btn-sm disabled": "btn btn-link btn-sm"} onClick={onClickGenBtn}>Generate Data</button>
                </div>
            </div>

        </>
    )
}

export default UserFilter