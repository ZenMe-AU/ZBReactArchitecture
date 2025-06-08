
// import { useState } from 'react';

interface UserFilterProps {
    onClick: () => void;
    onClickGenBtn: () => void;
    onCheck: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isDisabled: boolean;
    params: {lat?:number, lon?:number, distance?:number, limited?:number, searchTime?:string, interval?:string, attributes?:string, fuzzySearch?:boolean};
}


const UserFilter = ({onClick, params, onChange, onClickGenBtn, onCheck, isDisabled}: UserFilterProps) => {
    return (
        <>
            <div className="card mx-auto m-3" style={{width:"30rem"}}>
                <div className="card-body">
                    <div className="form-group">
                        <label>latitude</label>
                        <input type="number" name="lat" className="form-control" value={params.lat} onChange={onChange} />
                    </div><div className="form-group">
                        <label>longitude</label>
                        <input type="number" name="lon" className="form-control" value={params.lon} onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>datetime</label>
                        <input type="datetime-local" name="searchTime" className="form-control" value={params.searchTime} onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>interval(minute)</label>
                        <input type="number" name="interval" className="form-control" value={params.interval} min="10" step="10" onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>distance(meter)</label>
                        <input type="number" id="distance" name="distance" className="form-control" min="1" max="200" value={params.distance} onChange={onChange}/>
                    </div>
                    <div className="form-group">
                        <label>attributes</label>
                        <input type="text" name="attributes" className="form-control" value={params.attributes} onChange={onChange} />
                    </div>
                    <div className="form-check form-switch">
                        <input className="form-check-input" name="fuzzySearch" type="checkbox" role="switch" id="fuzzySearch" checked={!params.fuzzySearch} onChange={onCheck} />
                        <label className="form-check-label" htmlFor="fuzzySearch">Exactly Match</label>
                    </div>
                    {/* <div className="form-group">
                        <label>limited</label>
                        <input type="number" id="limited" name="limited" className="form-control" min="1" max="100" value={params.limited} onChange={onChange}/>
                    </div> */}
                    <button className="btn btn-primary mt-2" onClick={onClick}>Search</button>
                </div>
                {/* <div className="card-footer d-flex flex-row-reverse">
                    <button className={isDisabled ? "btn btn-link btn-sm disabled": "btn btn-link btn-sm"} onClick={onClickGenBtn}>Generate Data</button>
                </div> */}
            </div>

        </>
    )
}

export default UserFilter