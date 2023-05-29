
export function set_service_image_overlay(overlays, nodeId, image_url){
    let $rend = `<img src="`+image_url+`" style="width: 40px; height: 40px; border-radius: 5px; border: 1px solid #555;">`;
    overlays.add(nodeId, {
      position: {
        top: -16,
        left: -16
      },
      html: $rend
    });
}

export function set_service_task_image_element(overlays, element){
    if(element.type == 'bpmn:ServiceTask'){
        if(element.businessObject && element.businessObject.$attrs && element.businessObject.$attrs.service_data){
          let service_data = JSON.parse(element.businessObject.$attrs.service_data);

          if(service_data && service_data.service_selected && service_data.service_selected.logo){
            set_service_image_overlay(overlays, element.id, service_data.service_selected.logo);
          }
        }
    }
}
