<?php

namespace plugin\aoaostar_com\yanyu;


use app\model\Plugin;

class Install implements \plugin\Install
{

    public function Install(Plugin $model)
    {
        $model->title = '民间谚语在线查询_查找常见谚语';
        $model->class = plugin_current_class_get(__NAMESPACE__);
        $model->alias = base_space_name(__NAMESPACE__);
        $model->desc = '这是一款查找生活的常用经典谚语大全,谚语类似成语,但口语性强,通俗易懂,而且一般都表达一个完整的意思,形式上差不多都是一两个短句。';
        $model->version = 'v1.0';
    }

    public function UnInstall(Plugin $model)
    {

    }
}
